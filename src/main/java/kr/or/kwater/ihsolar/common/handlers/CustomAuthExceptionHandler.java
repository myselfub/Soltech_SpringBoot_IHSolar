package kr.or.kwater.ihsolar.common.handlers;

import java.io.IOException;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.FlashMap;
import org.springframework.web.servlet.support.SessionFlashMapManager;

import lombok.extern.slf4j.Slf4j;

/***
 * 커스텀 인증/인가 에러 핸들러 클래스
 */
@Slf4j
@Component
public class CustomAuthExceptionHandler
		implements AccessDeniedHandler, AuthenticationEntryPoint, AuthenticationFailureHandler {
	/***
	 * Spring 메세지 소스
	 */
	private final MessageSource messageSource;

	/***
	 * 생성자
	 * 
	 * @param handlerExceptionResolver : Spring 예외 처리 핸들러
	 */
	public CustomAuthExceptionHandler(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

	/***
	 * 인가(권한) 에러 처리 메소드
	 */
	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException, ServletException {
		Locale locale = LocaleContextHolder.getLocale();
		String errorMessage = messageSource.getMessage("auth.required", null, locale);

		FlashMap flashMap = new FlashMap();
		flashMap.put("errorMsg", errorMessage);
		new SessionFlashMapManager().saveOutputFlashMap(flashMap, request, response);
		response.sendRedirect("/");
	}

	/***
	 * 인증 에러 처리 메소드
	 */
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		Locale locale = LocaleContextHolder.getLocale();
		String errorMessage = messageSource.getMessage("auth.required", null, locale);

		FlashMap flashMap = new FlashMap();
		flashMap.put("errorMsg", errorMessage);
		new SessionFlashMapManager().saveOutputFlashMap(flashMap, request, response);
		response.sendRedirect("/");
	}

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, ServletException {
		Locale locale = LocaleContextHolder.getLocale();
		String errorMessage = messageSource.getMessage("auth.failure", null, locale);

		FlashMap flashMap = new FlashMap();
		flashMap.put("errorMsg", errorMessage);
		new SessionFlashMapManager().saveOutputFlashMap(flashMap, request, response);
		response.sendRedirect("/");
	}
}