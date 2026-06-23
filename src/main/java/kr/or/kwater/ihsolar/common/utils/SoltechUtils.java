package kr.or.kwater.ihsolar.common.utils;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;

import org.springframework.util.ObjectUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/***
 * 스트림 유틸 클래스
 */
public class SoltechUtils {
	/***
	 * 왼쪽 문자 채우기
	 * 
	 * @param orgStr  : 기존 문자
	 * @param length  : 채울 길이
	 * @param padChar : 채울 문자
	 * @return 채워진 문자
	 */
	public static String lpad(String orgStr, int length, char padChar) throws Exception {
		orgStr = Optional.ofNullable(orgStr).orElse("");
		int paddingLength = length - orgStr.length();
		if (paddingLength <= 0) {
			return orgStr;
		}
		StringBuilder sb = new StringBuilder(length);
		for (int i = 0; i < paddingLength; i++) {
			sb.append(padChar);
		}
		sb.append(orgStr);

		return sb.toString();
	}

	/***
	 * 문자 반복
	 * 
	 * @param orgStr : 기존 문자
	 * @param length : 길이
	 * @return 반복된 문자
	 */
	/*
	public static String repeatString(String orgStr, int length) {
		if (ObjectUtils.isEmpty(orgStr)) {
			return orgStr;
		}

		return orgStr.repeat(length / orgStr.length()) + orgStr.substring(0, length % orgStr.length());
	}
	*/

	/***
	 * 카멜케이스 문자를 스네이크케이스 문자로 변경
	 * 
	 * @param camelCaseStr : 카멜케이스 문자
	 * @return 스네이크케이스 문자
	 */
	public static String camelCaseToSnakeCase(String camelCaseStr) {
		if (ObjectUtils.isEmpty(camelCaseStr)) {
			return camelCaseStr;
		}

		StringBuilder stringBuilder = new StringBuilder();

		stringBuilder.append(Character.toLowerCase(camelCaseStr.charAt(0)));

		for (int i = 1; i < camelCaseStr.length(); i++) {
			char ch = camelCaseStr.charAt(i);

			if (Character.isUpperCase(ch)) {
				stringBuilder.append('_');
				stringBuilder.append(Character.toLowerCase(ch));
			} else {
				stringBuilder.append(ch);
			}
		}

		return stringBuilder.toString();
	}

	/***
	 * 문자형 날짜 데이터를 날짜형으로 변환
	 * 
	 * @param dateStr : 문자형 날짜
	 * @return 변환된 날짜형 데이터
	 */
	public static LocalDateTime parseDateTime(String dateStr) {
		if (ObjectUtils.isEmpty(dateStr)) {
			return null;
		}

		DateTimeFormatter[] dateTimeFormatters = new DateTimeFormatter[] { DateTimeFormatter.ofPattern("M/d/yyyy"),
				DateTimeFormatter.ofPattern("M/d/yyyy HH"), DateTimeFormatter.ofPattern("M/d/yyyy HH:mm"),
				DateTimeFormatter.ofPattern("M/d/yyyy HH:mm:ss"), DateTimeFormatter.ofPattern("M/d/yyyy HH:mm:ss.SSS"),
				DateTimeFormatter.ofPattern("M/d/yyyy hh:mm:ss a"), DateTimeFormatter.ofPattern("M/d/yyyy a hh:mm:ss"),
				DateTimeFormatter.ofPattern("yyyy-MM-dd"), DateTimeFormatter.ofPattern("yyyy-MM-dd HH"),
				DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
				DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"), DateTimeFormatter.ofPattern("yyyyMMdd"),
				DateTimeFormatter.ofPattern("yyyyMMdd HH"), DateTimeFormatter.ofPattern("yyyyMMdd HHmm"),
				DateTimeFormatter.ofPattern("yyyyMMdd HHmmss"), DateTimeFormatter.ofPattern("yyyyMMdd HHmmssSSS"),
				DateTimeFormatter.ISO_LOCAL_DATE, DateTimeFormatter.ISO_LOCAL_DATE_TIME,
				DateTimeFormatter.ISO_LOCAL_TIME, DateTimeFormatter.ISO_OFFSET_DATE,
				DateTimeFormatter.ISO_OFFSET_DATE_TIME, DateTimeFormatter.ISO_OFFSET_TIME };

		LocalDateTime localDateTime = null;

		for (DateTimeFormatter dateTimeFormatter : dateTimeFormatters) {
			try {
				localDateTime = LocalDateTime.parse(dateStr, dateTimeFormatter);
				break;
			} catch (Exception e) {
				try {
					LocalDate localDate = LocalDate.parse(dateStr, dateTimeFormatter);
					localDateTime = localDate.atStartOfDay();
				} catch (Exception ex) {
					continue;
				}
			}
		}

		return localDateTime;
	}

	/***
	 * 문자형 날짜 데이터를 원하는 포맷으로 변환
	 * 
	 * @param dateStr : 문자형 날짜
	 * @param format  : 원하는 포맷
	 * @return 변환된 포맷의 문자형 날짜
	 */
	public static String parseDateToString(String dateStr, String format) {
		if (ObjectUtils.isEmpty(dateStr) || ObjectUtils.isEmpty(format)) {
			return "";
		}

		String[] timeFormats = { "HHmmss", "HHmm", "HH" };
		for (String timeFormat : timeFormats) {
			if (format.replace(":", "").equals(timeFormat) && dateStr.length() < (timeFormat.length() + 1)) {
				dateStr = "19010101 " + dateStr;
				break;
			}
		}

		LocalDateTime parsedDate = parseDateTime(dateStr);
		if (ObjectUtils.isEmpty(parsedDate)) {
			if (!format.contains("T")) {
				dateStr = dateStr.replace("T", " ");
			}
			if (!format.contains("-")) {
				dateStr = dateStr.replace("-", "");
			}
			if (!format.contains("/")) {
				dateStr = dateStr.replace("/", "");
			}
			if (!format.contains(":")) {
				dateStr = dateStr.replace(":", "");
			}

			return dateStr;
		}

		return parsedDate.format(DateTimeFormatter.ofPattern(format));
	}

	/***
	 * Date형의 데이터가 들어가는 Key값인지 확인
	 * 
	 * @param key : Key 문자
	 * @return true/false
	 */
	public static boolean isDateKey(String key) {
		if (ObjectUtils.isEmpty(key)) {
			return false;
		}

		String[] containsStr = { "date", "ymd", "dt", "tm" };
		String lowerKey = key.toLowerCase();
		for (String containStr : containsStr) {
			if (lowerKey.endsWith(containStr) && !lowerKey.endsWith("regdt") && !lowerKey.endsWith("mdfcndt")) {
				return true;
			}
		}

		return false;
	}

	/***
	 * LocalDateTime의 날짜 차이 계산
	 * 
	 * @param bgng            : 시작 일시
	 * @param end             : 종료 일시
	 * @param containsHoliday : 휴일 포함 여부
	 * @param holidaysSet     : 공휴일 목록
	 * @return
	 */
	public static double calcDateDiff(LocalDateTime bgng, LocalDateTime end, boolean containsHoliday,
			Set<LocalDate> holidaysSet) {
		double prdDay = 0;
		if (containsHoliday) {
			/*
			 * if (Duration.between(bgng, end).toDays() < 8d) { Duration.between(bgng,
			 * end).toDays() / 8.0d; }
			 */
			prdDay = Duration.between(bgng, end).toDays() + 1;
		} else {
			LocalDateTime currentDt = bgng;
			while (!currentDt.isAfter(end)) {
				if (currentDt.getDayOfWeek().getValue() != 6 && currentDt.getDayOfWeek().getValue() != 7
						&& (!holidaysSet.contains(currentDt.toLocalDate()))) {
					prdDay++;
				}

				currentDt = currentDt.plusDays(1);
			}
		}

		return (double) prdDay;
	}

	/***
	 * LocalDateTime의 날짜 사이의 목록
	 * 
	 * @param bgng            : 시작 일시
	 * @param end             : 종료 일시
	 * @param containsHoliday : 휴일 포함 여부
	 * @param holidaysSet     : 공휴일 목록
	 * @return
	 */
	public static List<LocalDateTime> calcDateBetween(LocalDateTime bgng, LocalDateTime end, boolean containsHoliday,
			Set<LocalDate> holidaysSet) {
		List<LocalDateTime> localDateTimeList = new ArrayList<LocalDateTime>();
		LocalDateTime currentDt = bgng;
		while (!currentDt.isAfter(end)) {
			if (containsHoliday) {
				localDateTimeList.add(currentDt);
			} else {
				if (currentDt.getDayOfWeek().getValue() != 6 && currentDt.getDayOfWeek().getValue() != 7
						&& (!holidaysSet.contains(currentDt.toLocalDate()))) {
					localDateTimeList.add(currentDt);
				}
			}

			currentDt = currentDt.plusDays(1);
		}

		return localDateTimeList;
	}

	/***
	 * Map의 Key을 스네이크 케이스로 변경하고, 날짜형식 String을 parseDateFormat로 변환
	 * 
	 * @param map              : 변환할 Map
	 * @param parseDateFormat1 : 변환할 날짜 포맷
	 * @param parseDateFormat1 : 실패시 변환할 날짜 포맷
	 * @return 변환된 Map
	 */
	@SuppressWarnings("unchecked")
	public static Map<String, Object> convertResultMap(Map<String, Object> map, String parseDateFormat1,
			String parseDateFormat2) {
		if (ObjectUtils.isEmpty(map)) {
			return map;
		}
		if (ObjectUtils.isEmpty(parseDateFormat1)) {
			parseDateFormat1 = "yyyy-MM-dd";
		}
		if (ObjectUtils.isEmpty(parseDateFormat2)) {
			parseDateFormat2 = "HH:mm:ss";
		}

		Map<String, Object> newMap = new HashMap<String, Object>();
		for (String key : map.keySet()) {
			if (map.get(key) instanceof Map) {
				Map<String, Object> newMapInner = new HashMap<String, Object>();
				for (String innerKey : ((Map<String, Object>) map.get(key)).keySet()) {
					Object value = ((Map<String, Object>) map.get(key)).get(innerKey);
					if (SoltechUtils.isDateKey(innerKey) && value instanceof String) {
						value = SoltechUtils.parseDateToString(
								(String) ((Map<String, ?>) map.get(key)).get(innerKey), parseDateFormat1);
						if (ObjectUtils.isEmpty(value)) {
							value = SoltechUtils.parseDateToString(
									(String) ((Map<String, ?>) map.get(key)).get(innerKey), parseDateFormat2);
						}
					}
					newMapInner.put(SoltechUtils.camelCaseToSnakeCase(innerKey), value);
				}
				map.put(key, newMapInner);
			} else if (map.get(key) instanceof String && ((String) map.get(key)).matches("^\\{.*\\}$")) {
				ObjectMapper objectMapper = new ObjectMapper();
				try {
					Map<String, Object> jsonMap = objectMapper.readValue((String) map.get(key), Map.class);
					Map<String, Object> newMapInner = new HashMap<String, Object>();
					for (String innerKey : jsonMap.keySet()) {
						Object value = jsonMap.get(innerKey);
						if (SoltechUtils.isDateKey(innerKey) && value instanceof String) {
							value = SoltechUtils.parseDateToString((String) jsonMap.get(innerKey),
									parseDateFormat1);
							if (ObjectUtils.isEmpty(value)) {
								value = SoltechUtils.parseDateToString((String) jsonMap.get(innerKey),
										parseDateFormat2);
							}
						}
						newMapInner.put(SoltechUtils.camelCaseToSnakeCase(innerKey), value);
					}
					map.put(key, newMapInner);
				} catch (JsonProcessingException e) {
				}
			} else if (map.get(key) instanceof String && SoltechUtils.isDateKey(key)) {
				Object value = SoltechUtils.parseDateToString((String) map.get(key), parseDateFormat1);
				if (ObjectUtils.isEmpty(value)) {
					value = SoltechUtils.parseDateToString((String) map.get(key), parseDateFormat2);
				}
				map.put(key, value);
			}
			newMap.put(SoltechUtils.camelCaseToSnakeCase(key), map.get(key));
		}

		return newMap;
	}

	/***
	 * 사용자 IP 추출
	 * 
	 * @param request : HttpServletRequest
	 * @return 사용자 IP
	 */
	public static String getClientIP(HttpServletRequest request) {
		String clientIP = request.getHeader("X-Forwarded-For");

		if (clientIP == null) {
			clientIP = request.getHeader("Proxy-Client-IP");
		}
		if (clientIP == null) {
			clientIP = request.getHeader("WL-Proxy-Client-IP");
		}
		if (clientIP == null) {
			clientIP = request.getHeader("HTTP_CLIENT_IP");
		}
		if (clientIP == null) {
			clientIP = request.getHeader("HTTP_X_FORWARDED_FOR");
		}
		if (clientIP == null) {
			clientIP = request.getRemoteAddr();
		}

		return clientIP;
	}

	/***
	 * 파일 다운로드를 위한 Header의 ContentDisposition 문자열
	 * 
	 * @param userAgent : Header의 UserAgent
	 * @param fileName  : 파일명
	 * @return ContentDisposition 문자열
	 */
	public static String getContentDisposition(String userAgent, String fileName) throws Exception {
		String encodedFilename = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
		String contentDisposition = "attachment; filename=\"" + encodedFilename + "\"";
		if (!ObjectUtils.isEmpty(userAgent) && (userAgent.contains("MSIE") || userAgent.contains("Trident"))) {
			contentDisposition = "attachment; filename=\"" + encodedFilename + "\"";
		} else if (!ObjectUtils.isEmpty(userAgent)
				&& (userAgent.contains("Firefox") || userAgent.contains("Chrome") || userAgent.contains("Safari"))) {
			contentDisposition = "attachment; filename*=UTF-8''" + encodedFilename;
		}

		return contentDisposition;
	}

	/***
	 * 사인 이미지 생성
	 * 
	 * @param text   : 텍스트
	 * @param isSave : 파일 저장 여부
	 * @return BASE64 인코딩 이미지
	 */
	public static String createSignImage(String text, boolean isSave, String filePath) {
		String preStr = "data:image/png;base64,";
		String name = text;
		int width = 100;
		int height = 46;

		// 초기 설정
		BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
		Graphics2D graphics2d = bufferedImage.createGraphics();
		graphics2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		int padding = 4;

		// 배경
		graphics2d.setColor(new Color(255, 255, 255, 0));
		graphics2d.fillRect(0, 0, width, height);

		// 바깥선
		graphics2d.setColor(Color.decode("#FF0000"));
		graphics2d.setStroke(new BasicStroke(2));
		graphics2d.drawRect(padding, padding, width - (padding * 2), height - (padding * 2));

		// 안쪽선
		graphics2d.setColor(Color.decode("#FF0000"));
		graphics2d.setStroke(new BasicStroke(2));
		graphics2d.drawRect(padding * 2, padding * 2, width - (padding * 4), height - (padding * 4));

		// 글자
		graphics2d.setColor(Color.decode("#FF0000"));
		graphics2d.setFont(new Font("맑은 고딕", Font.BOLD, 18));
		FontMetrics fontMetrics = graphics2d.getFontMetrics();
		int textWidth = fontMetrics.stringWidth(name);
		int textHeight = fontMetrics.getHeight();

		int textX = (width - textWidth) / 2;
		int textY = ((height - 1) / 2) + (textHeight / 3);

		graphics2d.drawString(name, textX, textY);
		graphics2d.dispose();

		try {
			if (isSave && !ObjectUtils.isEmpty(filePath)) {
				File file = new File(filePath + "/" + text + "_sign.png");
				ImageIO.write(bufferedImage, "PNG", file);
			}
			ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
			ImageIO.write(bufferedImage, "PNG", byteArrayOutputStream);
			byte[] imageBytes = byteArrayOutputStream.toByteArray();

			return preStr + Base64.getEncoder().encodeToString(imageBytes);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return "";
	}

	/***
	 * 파일명의 확장자 명 파싱
	 * 
	 * @param fileName : 파일명
	 * @return 확장자명
	 */
	public static String parseExtensionName(String fileName) throws Exception {
		String extension = "";
		int dotIndex = fileName.lastIndexOf('.');
		if (dotIndex != -1) {
			extension = fileName.substring(dotIndex + 1);
		}

		return extension;
	}

	/***
	 * 파일명의 확장자 앞에 문자 추가
	 * 
	 * @param fileName : 파일명
	 * @param addStr   : 추가할 문자
	 * @return 문구가 추가된 파일명
	 */
	public static String changeFileName(String fileName, String addStr, List<String> validExtension) throws Exception {
		if (ObjectUtils.isEmpty(addStr)) {
			addStr = "_" + System.currentTimeMillis();
		}
		String extension = parseExtensionName(fileName);
		int dotIndex = fileName.lastIndexOf('.');
		if (dotIndex == -1) {
			dotIndex = fileName.length();
		}
		if (!validExtension.contains("*") && !validExtension.contains(extension)) {
			throw new IllegalArgumentException("Unsupport Extension Error");
		}
		String fileNameWithoutExtension = fileName.substring(0, dotIndex);

		return fileNameWithoutExtension + addStr + "." + extension;
	}

	/***
	 * 현재시간을 Base62로 인코딩하여 고유 ID값 생성
	 * 
	 * @return 생성된 ID
	 * @throws Exception
	 */
	public static String createEncodeId() throws Exception {
		return base62Encode(Long.toHexString(System.currentTimeMillis()));
	}

	/***
	 * 알고리즘에 따른 암호화
	 * 
	 * @param algorithm : 알고리즘명
	 * @param secretKey : 시크릿키
	 * @param data      : 암호화할 문자
	 * @return 암호화된 문자
	 * @throws Exception
	 */
	public static String encode(String algorithm, String secretKey, String data) throws Exception {
		Cipher cipher = Cipher.getInstance(algorithm);
		SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), algorithm);
		cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
		byte[] encodedData = cipher.doFinal(data.getBytes());

		return Base64.getEncoder().encodeToString(encodedData);
	}

	/***
	 * 알고리즘에 따른 복호화
	 * 
	 * @param algorithm   : 알고리즘명
	 * @param secretKey   : 시크릿키
	 * @param encodedData : 암호화된 문자(복호화할 문자)
	 * @return 복호화된 문자
	 * @throws Exception
	 */
	public static String decode(String algorithm, String secretKey, String encodedData) throws Exception {
		Cipher cipher = Cipher.getInstance(algorithm);
		SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), algorithm);
		cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
		byte[] decodedData = cipher.doFinal(Base64.getDecoder().decode(encodedData));

		return new String(decodedData);
	}

	/***
	 * BASE62 문자
	 */
	private static final String BASE62_WORD = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	/***
	 * BASE62 암호화
	 * 
	 * @param data : 암호화할 문자
	 * @return BASE62 암호화된 문자
	 */
	public static String base62Encode(String data) throws Exception {
		byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
		BigInteger bigInteger = new BigInteger(1, bytes);
		StringBuilder sringBuilder = new StringBuilder();
		while (bigInteger.compareTo(BigInteger.ZERO) > 0) {
			BigInteger[] divRem = bigInteger.divideAndRemainder(BigInteger.valueOf(62));
			sringBuilder.append(BASE62_WORD.charAt(divRem[1].intValue()));
			bigInteger = divRem[0];
		}

		return sringBuilder.reverse().toString();
	}

	/***
	 * BASE62 복호화
	 * 
	 * @param encodeData : 복호화할 문자
	 * @return BASE62 복호화된 문자
	 */
	public static String base62Decode(String encodeData) throws Exception {
		BigInteger bigInteger = BigInteger.ZERO;
		for (int i = 0; i < encodeData.length(); i++) {
			int chIdx = BASE62_WORD.indexOf(encodeData.charAt(i));
			if (chIdx == -1) {
				throw new IllegalArgumentException("Invalid Base62 encoded");
			}
			bigInteger = bigInteger.multiply(BigInteger.valueOf(62)).add(BigInteger.valueOf(chIdx));
		}

		try {
			return new String(bigInteger.toByteArray(), StandardCharsets.UTF_8);
		} catch (Exception e) {
			throw new IllegalArgumentException("Invalid Base62 encoded");
		}
	}

}