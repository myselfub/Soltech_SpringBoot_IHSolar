package kr.or.kwater.ihsolar.user.model;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

/***
 * 사용자 모델 클래스
 */
@Builder(toBuilder = true)
@Getter
@ToString
public class UserModel {
	private String userId;
	private String userPw;
	private String userRole;
}