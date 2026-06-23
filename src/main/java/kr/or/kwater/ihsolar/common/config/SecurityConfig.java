package kr.or.kwater.ihsolar.common.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import kr.or.kwater.ihsolar.common.handlers.CustomAuthExceptionHandler;
import lombok.extern.slf4j.Slf4j;

/***
 * 스프링 시큐리티 설정 클래스
 */
@Slf4j
@EnableWebSecurity
@Configuration
public class SecurityConfig {
	/***
	 * 인가 없는 URL 목록
	 */
	private final String[] PERMIT_URI = { "/", "/login", "/css/**", "/js/**" };

	/***
	 * 커스텀 인증/인가 에러 핸들러 클래스
	 */
	private final CustomAuthExceptionHandler customAuthExceptionHandler;

	/***
	 * 생성자
	 * 
	 * @param customAuthExceptionHandler : 커스텀 인증/인가 에러 핸들러 클래스
	 */
	public SecurityConfig(CustomAuthExceptionHandler customAuthExceptionHandler) {
		this.customAuthExceptionHandler = customAuthExceptionHandler;
	}

	/***
	 * 스프링 시큐리티 필터 설정(CSRF, CORS, AUTH, JWT 등)
	 * 
	 * @param httpSecurity
	 * @return 시큐리티 필터 체인 클래스
	 * @throws Exception
	 */
	@Bean
	SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
		httpSecurity.csrf(csrf -> csrf.disable()); // 필요할수도?
		httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource()));

		httpSecurity.formLogin(formLogin -> formLogin.loginPage("/").loginProcessingUrl("/login")
				.usernameParameter("userId").passwordParameter("userPw").defaultSuccessUrl("/home", true)
				.failureHandler(customAuthExceptionHandler).permitAll());
		httpSecurity.logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/").permitAll());
		httpSecurity.httpBasic(httpBasic -> httpBasic.disable()); // AbstractHttpConfigurer::disable
		httpSecurity.sessionManagement(
				session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED).maximumSessions(1));

		httpSecurity.authorizeHttpRequests(
				authorize -> authorize.requestMatchers(PERMIT_URI).permitAll().anyRequest().authenticated());

		httpSecurity.exceptionHandling(exception -> exception.authenticationEntryPoint(customAuthExceptionHandler)
				.accessDeniedHandler(customAuthExceptionHandler));

		return httpSecurity.build();
	}

	/***
	 * 스프링 시큐리티 인증 처리 설정
	 * 
	 * @param authenticationConfiguration
	 * @return 인증 처리 클래스
	 * @throws Exception
	 */
	@Bean
	AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
			throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	/***
	 * 패스워드 인코딩 설정
	 * 
	 * @return 패스워드 인코더 클래스
	 */
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/***
	 * CORS 설정
	 * 
	 * @return CORS 설정 클래스
	 */
	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration corsConfiguration = new CorsConfiguration();
		// corsConfiguration.addAllowedOrigin("http://[FRONTENDIP]:8081");
		corsConfiguration.addAllowedOriginPattern("*");
		corsConfiguration.addAllowedHeader("*");
		corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
		/*
		 * corsConfiguration.addAllowedMethod("GET");
		 * corsConfiguration.addAllowedMethod("POST");
		 * corsConfiguration.addAllowedMethod("DELETE");
		 * corsConfiguration.addAllowedMethod("PUT");
		 */
		corsConfiguration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**", corsConfiguration);

		return urlBasedCorsConfigurationSource;
	}
}
