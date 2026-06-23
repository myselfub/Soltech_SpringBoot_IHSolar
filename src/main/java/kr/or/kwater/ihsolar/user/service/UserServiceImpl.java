package kr.or.kwater.ihsolar.user.service;

import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import kr.or.kwater.ihsolar.common.model.CustomUserDetails;
import kr.or.kwater.ihsolar.common.service.UserPropertyProvider;
import kr.or.kwater.ihsolar.user.model.UserModel;
import lombok.RequiredArgsConstructor;

/***
 * 사용자 서비스 클래스
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
	/***
	 * 패스워드 인코더 인터페이스
	 */
	private final PasswordEncoder passwordEncoder;
	/***
	 * 사용자 프로퍼티 프로바이더
	 */
	private final UserPropertyProvider userPropertyProvider;

	/***
	 * 로그인
	 */
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Map<String, String> userInnerMap = userPropertyProvider.getUserMap().get(username);
		if (!ObjectUtils.isEmpty(userInnerMap)) {
			return new CustomUserDetails(UserModel.builder().userId(username)
					.userPw(passwordEncoder.encode(userInnerMap.get(userPropertyProvider.getUSER_PASSWORD_KEY())))
					.userRole(userInnerMap.get(userPropertyProvider.getUSER_ROLE_KEY())).build());
		}

		throw new UsernameNotFoundException("User not found");
	}

	/***
	 * 비밀번호 비교
	 */
	@Override
	public boolean matchPassword(String rawPassword, String encodedPassword) {
		return passwordEncoder.matches(rawPassword, encodedPassword);
	}
}