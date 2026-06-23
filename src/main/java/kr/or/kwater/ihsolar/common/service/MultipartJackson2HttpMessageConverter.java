package kr.or.kwater.ihsolar.common.service;

import java.lang.reflect.Type;

import org.springframework.http.MediaType;
import org.springframework.http.converter.json.AbstractJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

/***
 * JSON 직렬화, 역직렬화 처리 클래스 (파일 업로드의 @RequestPart 사용을 위해)
 */
@Component
public class MultipartJackson2HttpMessageConverter extends AbstractJackson2HttpMessageConverter {
	/***
	 * 생성자(오버라이딩)
	 */
	public MultipartJackson2HttpMessageConverter(ObjectMapper objectMapper) {
		super(objectMapper, MediaType.APPLICATION_OCTET_STREAM);
	}

	/***
	 * canWrite 오버라이딩
	 */
	@Override
	public boolean canWrite(Class<?> clazz, MediaType mediaType) {
		return false;
	}

	/***
	 * canWrite 오버라이딩
	 */
	@Override
	public boolean canWrite(Type type, Class<?> clazz, MediaType mediaType) {
		return false;
	}

	/***
	 * canWrite 오버라이딩
	 */
	@Override
	protected boolean canWrite(MediaType mediaType) {
		return false;
	}

}