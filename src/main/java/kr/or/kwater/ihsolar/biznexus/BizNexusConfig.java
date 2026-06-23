package kr.or.kwater.ihsolar.biznexus;

import java.net.URL;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;
import org.apache.commons.configuration.reloading.FileChangedReloadingStrategy;

public class BizNexusConfig {

	private static PropertiesConfiguration config;
	private static final String CONFIG_FILE = "biznexus.properties";
	public static final String KEY_BIZNEXUS_REQ_TAG_IP = "biznexus.req-tag.ip";
	public static final String KEY_BIZNEXUS_REQ_TAG_PORT = "biznexus.req-tag.port";

	static {
		try {
			URL url = BizNexusConfig.class.getResource("/" + CONFIG_FILE);
			config = new PropertiesConfiguration(url);
			config.setReloadingStrategy(new FileChangedReloadingStrategy());
		} catch (ConfigurationException e) {
			System.out.println("ConfigurationException Occured");
		}
	}

	public static String getString(String key) {
		return config.getString(key);
	}

	public static int getInt(String key) {
		return config.getInt(key);
	}

	public static double getDouble(String key) {
		return config.getDouble(key);
	}

	public static boolean getBoolean(String key) {
		if (config.getString(key) == null)
			return false;
		return config.getBoolean(key);
	}

}