package kr.or.kwater.ihsolar.common.model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import kr.or.kwater.ihsolar.user.model.UserModel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

/***
 * 스프링 시큐리티 사용자모델 DTO
 */
@RequiredArgsConstructor
@Getter
@ToString
public class CustomUserDetails implements UserDetails {
	/***
	 * 직렬화 UID
	 */
	private static final long serialVersionUID = 1L;

	/***
	 * 사용자 모델 클래스
	 */
	private final UserModel userModel;

	/***
	 * 권한 가져오기
	 */
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		List<String> roleList = new ArrayList<String>();
		roleList.add("AUTHRT_" + userModel.getUserRole());

		return roleList.stream().map(cd -> new SimpleGrantedAuthority(cd)).collect(Collectors.toList());
	}

	/***
	 * 패스워드 가져오기
	 */
	@Override
	public String getPassword() {
		return userModel.getUserPw();
	}

	/***
	 * ID 가져오기
	 */
	@Override
	public String getUsername() {
		return userModel.getUserId();
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}