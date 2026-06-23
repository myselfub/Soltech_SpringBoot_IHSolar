package kr.or.kwater.ihsolar.common.model;

import java.io.IOException;

import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import kr.or.kwater.ihsolar.common.utils.SoltechUtils;

/***
 * 커스텀 날짜 직렬화
 */
public class CustomDateSerializer extends JsonSerializer<String> {
	@Override
	public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
		if (!ObjectUtils.isEmpty(value)) {
			String result = SoltechUtils.parseDateToString(value, "yyyy-MM-dd");
			result = ObjectUtils.isEmpty(result) ? "" : result;
			gen.writeString(result);
		} else {
			gen.writeString(value);
		}
	}
}