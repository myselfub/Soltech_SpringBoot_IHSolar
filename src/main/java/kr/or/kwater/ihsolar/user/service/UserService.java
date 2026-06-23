package kr.or.kwater.ihsolar.user.service;

import org.springframework.security.core.userdetails.UserDetailsService;

/***
 * 사용자 서비스 인터페이스
 */
public interface UserService extends UserDetailsService {
	/***
	 * 비밀번호 비교
	 * 
	 * @param rawPassword     : 파라메터 패스워드
	 * @param encodedPassword : 저장된 패스워드
	 * @return 일치 여부
	 */
	public boolean matchPassword(String rawPassword, String encodedPassword);
}