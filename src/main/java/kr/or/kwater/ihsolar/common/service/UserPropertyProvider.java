package kr.or.kwater.ihsolar.common.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.annotation.PreDestroy;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/***
 * 사용자 프로퍼티 프로바이더
 */
@Service
public class UserPropertyProvider {
	/***
	 * 사용자 패스워드 Key
	 */
	private final String USER_PASSWORD_KEY = "password";
	/***
	 * 사용자 권한 Key
	 */
	private final String USER_ROLE_KEY = "role";

	/***
	 * 프로퍼티
	 */
	private final Properties properties = new Properties();
	/***
	 * 프로퍼티 경로
	 */
	private final Path propertiesPath;
	/***
	 * 사용자 Map
	 */
	private Map<String, Map<String, String>> userMap = new HashMap<String, Map<String, String>>();

	/***
	 * 쓰레드 가동 여부
	 */
	private volatile boolean running = true;

	/***
	 * 생성자
	 * 
	 * @throws IOException
	 */
	public UserPropertyProvider() throws IOException {
		// 기존 코드
		//this.propertiesPath = new ClassPathResource("users.properties").getFile().toPath();
		File externalFile = new File("users.properties");
	    if (externalFile.exists()) {
	        this.propertiesPath = externalFile.toPath();
	    } else {
	        ClassPathResource resource = new ClassPathResource("users.properties");
	        try (InputStream input = resource.getInputStream()) {
	            File tempFile = File.createTempFile("users", ".properties");
	            tempFile.deleteOnExit(); 
	            
	            try (FileOutputStream out = new FileOutputStream(tempFile)) {
	                byte[] buffer = new byte[1024];
	                int bytesRead;
	                while ((bytesRead = input.read(buffer)) != -1) {
	                    out.write(buffer, 0, bytesRead);
	                }
	            }

	            this.propertiesPath = tempFile.toPath();
	        }
	    }
		loadProperties();
		watchProperties();
	}

	/***
	 * 프로퍼티 변경 감지
	 */
	private void watchProperties() {
		Thread watcherThread = new Thread(() -> {
			try {
				WatchService watchService = FileSystems.getDefault().newWatchService();
				propertiesPath.getParent().register(watchService, StandardWatchEventKinds.ENTRY_MODIFY);

				while (running) {
					WatchKey watchKey = watchService.take();
					for (WatchEvent<?> watchEvent : watchKey.pollEvents()) {
						Path changed = (Path) watchEvent.context();
						if (changed.endsWith(propertiesPath.getFileName())) {
							loadProperties();
						}
					}
					watchKey.reset();
				}
			} catch (InterruptedException ie) {
				Thread.currentThread().interrupt();
				System.err.println(ie.getMessage());
			} catch (Exception e) {
				e.printStackTrace();
				System.err.println(e.getMessage());
			}
		});
		watcherThread.setDaemon(true);
		watcherThread.start();
	}

	@PreDestroy
	public void stopWatcher() {
		this.running = false;
	}

	/***
	 * 프로퍼티 로딩
	 * 
	 * @throws IOException
	 */
	private void loadProperties() throws IOException {
		try (InputStream inputStream = new FileInputStream(propertiesPath.toFile())) {
			properties.clear();
			properties.load(inputStream);
		} catch (Exception e) {
			e.printStackTrace();
			System.err.println(e.getMessage());
		}

		userMap.clear();
		int idx = 1;
		while (true) {
			String userKey = "user" + idx;
			String pwKey = "password" + idx;
			String roleKey = "role" + idx;

			if (!properties.containsKey(userKey) || !properties.containsKey(pwKey)) {
				break;
			}

			String userId = properties.getProperty(userKey);
			String userPw = properties.getProperty(pwKey);
			String userRole = properties.getProperty(roleKey);
			Map<String, String> userInnerMap = new HashMap<String, String>();
			userInnerMap.put(USER_PASSWORD_KEY, userPw);
			userInnerMap.put(USER_ROLE_KEY, userRole);
			userMap.put(userId, userInnerMap);
			idx++;
		}
	}

	/***
	 * 사용자 Map Getter
	 * 
	 * @return 사용자 Map
	 */
	public Map<String, Map<String, String>> getUserMap() {
		return userMap;
	}

	/***
	 * 사용자 패스워드 Key Getter
	 * 
	 * @return 사용자 패스워드 Key
	 */
	public String getUSER_PASSWORD_KEY() {
		return USER_PASSWORD_KEY;
	}

	/***
	 * 사용자 롤 Key Getter
	 * 
	 * @return 사용자 롤 Key
	 */
	public String getUSER_ROLE_KEY() {
		return USER_ROLE_KEY;
	}
}