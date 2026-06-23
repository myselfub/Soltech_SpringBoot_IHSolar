package kr.or.kwater.ihsolar.common.service;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.http.HttpStatus;

/***
 * 공통 응답 포맷 DTO 적용 어노테이션
 */
@Target({ ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface CustomResponseAPI {
	/***
	 * HTTP 상태 코드 옵션
	 * 
	 * @return HTTP 상태 코드
	 */
	public HttpStatus status() default HttpStatus.OK;
}