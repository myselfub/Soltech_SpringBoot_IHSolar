package kr.or.kwater.ihsolar.biznexus;

import java.awt.GraphicsEnvironment;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.biznexus.bizmanager.TagAccess;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
public class BizNexusController {
	protected static String reqTagIpAddr = BizNexusConfig.getString(BizNexusConfig.KEY_BIZNEXUS_REQ_TAG_IP);
	protected static String reqTagPort = BizNexusConfig.getString(BizNexusConfig.KEY_BIZNEXUS_REQ_TAG_PORT);
	protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(BizNexusController.class);
	private int m_nMaxMemory = 0;

	static {
		/* JDK에 dll 파일 첨부시 */
		//System.loadLibrary("TagAPI64");
		/* 프로젝트 내부 dll 파일 사용시 */
		try {
			InputStream inputStream = new ClassPathResource("dll/TagAPI64.dll").getInputStream();
			String tempDir = BizNexusController.class.getClassLoader().getResource(".").toString();
			tempDir = tempDir.replace("file:/", "");
			File dir = new File(tempDir + "/tempDll");
			if(!dir.exists()) {
				dir.mkdir();
			}

			File temporaryDll = File.createTempFile("TagAPI64", ".dll", dir);
			FileOutputStream outputStream = new FileOutputStream(temporaryDll);
			byte[] array = new byte[8192];
			int read = 0;
			while ((read = inputStream.read(array)) > 0) {
				outputStream.write(array, 0, read);
			}
			outputStream.close();
			System.load(temporaryDll.getPath());
			temporaryDll.deleteOnExit();
		} catch (IOException e) {
			System.err.println(e.getMessage());
			e.printStackTrace();
		}
	}

	@ResponseBody
	@RequestMapping(value = "/req-tag", produces = "application/json; charset=UTF-8")
	public String ReqTag(Model model, @RequestBody String param) {
		String strRet = "";

		TagAccess tagAccess = new TagAccess();
		int nRet = tagAccess.connect(reqTagIpAddr, "", Integer.parseInt(reqTagPort));
		if (nRet == 0) {
			strRet = tagAccess.exec(param);
			tagAccess.close();
		} else {
			strRet = "{}";
		}

		return strRet;
	}

	private String getImageList(String strPath) throws IOException {
		List<JSONObject> arr = new ArrayList<JSONObject>();

		Resource resource = new ClassPathResource("static/layout/" + strPath + ".resources/");
		File dir = resource.getFile();
		for (String str : dir.list()) {
			if (str.endsWith(".png") || str.endsWith(".jpg") || str.endsWith(".gif")) {
				HashMap<String, Object> hash = new HashMap<String, Object>();
				hash.put("name", str);
				arr.add(new JSONObject(hash));
			}
		}

		HashMap<String, Object> hash = new HashMap<String, Object>();
		hash.put("cmd", "images");
		hash.put("param", arr);
		JSONObject obj = new JSONObject(hash);

		return obj.toString();
	}

	HashMap<String, Object> parseRoot(HashMap<String, Object> hash, String xmlFile) {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		try {
			DocumentBuilder builder = factory.newDocumentBuilder();

			org.w3c.dom.Document document = builder.parse(xmlFile);
			org.w3c.dom.Element root = document.getDocumentElement();
			NamedNodeMap map = ((Node) root).getAttributes();
			String width = map.getNamedItem("width").getNodeValue();
			String height = map.getNamedItem("height").getNodeValue();
			String comment = "", slide = "0";
			try {
				comment = map.getNamedItem("comment").getNodeValue();
				slide = map.getNamedItem("slide").getNodeValue();
			} catch (Exception e) {
			}

			hash.put("width", width);
			hash.put("height", height);
			hash.put("comment", comment);
			hash.put("slide", Integer.parseInt(slide) == 1 ? true : false);
		} catch (Exception e) {
			e.printStackTrace();
		}

		return hash;
	}

	/*
	 * private String getFontList() { String[] fontList = { "Arial", "Verdana",
	 * "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond",
	 * "Courier New", "Brush Script MT" };
	 * 
	 * List<JSONObject> arr = new ArrayList<JSONObject>(); for(String strFont :
	 * fontList) { HashMap<String, Object> hash = new HashMap<String, Object>();
	 * hash.put("name", strFont);
	 * 
	 * arr.add(new JSONObject(hash)); }
	 * 
	 * HashMap<String, Object> hash = new HashMap<String, Object>(); hash.put("cmd",
	 * "font"); hash.put("param", arr ); JSONObject obj = new JSONObject(hash);
	 * 
	 * return obj.toString(); }
	 */

	private String getFontList() {
		GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
		String[] names = ge.getAvailableFontFamilyNames();
		List<JSONObject> arr = new ArrayList<JSONObject>();
		for (String strFont : names) {
			HashMap<String, Object> hash = new HashMap<String, Object>();
			hash.put("name", strFont);

			arr.add(new JSONObject(hash));
		}

		HashMap<String, Object> hash = new HashMap<String, Object>();
		hash.put("cmd", "font");
		hash.put("param", arr);
		JSONObject obj = new JSONObject(hash);

		return obj.toString();
	}

	private String getLayoutList() throws IOException {
		List<JSONObject> arr = new ArrayList<JSONObject>();

		Resource resource = new ClassPathResource("static/layout/");
		File dir = resource.getFile();
		String strPath = dir.getAbsolutePath();
		for (String str : dir.list()) {
			if (str.endsWith(".xml") == false)
				continue;

			HashMap<String, Object> hash = new HashMap<String, Object>();
			hash.put("name", str.substring(0, str.indexOf(".xml")));
			parseRoot(hash, strPath + "\\" + str);

			Path file = Paths.get(strPath + "\\" + str);
			try {
				FileTime lastModifiedTime = Files.getLastModifiedTime(file);
				LocalDateTime convertedFileTime = LocalDateTime.ofInstant(lastModifiedTime.toInstant(),
						ZoneId.systemDefault());
				String strModifiedTime = convertedFileTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
				hash.put("time", strModifiedTime);
			} catch (IOException e) {
				e.printStackTrace();
			}

			arr.add(new JSONObject(hash));
		}

		HashMap<String, Object> hash = new HashMap<String, Object>();
		hash.put("cmd", "layout");
		hash.put("param", arr);
		JSONObject obj = new JSONObject(hash);

		return obj.toString();
	}

	private String deleteImage(String strPath, String strImage) throws IOException {
		Resource resource = new ClassPathResource("static/layout/" + strPath + ".resources/" + strImage);
		File image = resource.getFile();
		boolean bRet = image.delete();

		HashMap<String, Object> hash = new HashMap<String, Object>();
		hash.put("cmd", "del-image");
		hash.put("param", bRet ? "Ok" : "False");
		JSONObject obj = new JSONObject(hash);

		return obj.toString();
	}

	private String deleteLayout(String strPath) throws IOException {
		String strLayoutPath = new ClassPathResource("static/layout/").getPath();
		String strResourcePath = strLayoutPath + strPath + ".resources/";
		boolean bRet = true;
		try {
			File resourceFolder = new File(strResourcePath);
			FileUtils.cleanDirectory(resourceFolder);
			resourceFolder.delete();

			File layoutFile = new File(strLayoutPath + strPath + ".xml");
			layoutFile.delete();
		} catch (IOException e) {
			bRet = false;
		}
		HashMap<String, Object> hash = new HashMap<String, Object>();
		hash.put("cmd", "del-layout");
		hash.put("param", bRet ? "Ok" : "False");
		JSONObject obj = new JSONObject(hash);

		return obj.toString();
	}

	private void writeLayout(String strFile) {
		try {
			DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

			Document doc = docBuilder.newDocument();
			doc.setXmlStandalone(true);

			Element node = doc.createElement("BizNexus");
			node.setAttribute("comment", "");
			node.setAttribute("width", "1920");
			node.setAttribute("height", "1080");
			node.setAttribute("backColor", "16777215");
			node.setAttribute("backImage", "");

			doc.appendChild(node);

			TransformerFactory transformerFactory = TransformerFactory.newInstance();
			Transformer transformer = transformerFactory.newTransformer();
			transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
			// transformer.setOutputProperty(OutputKeys.INDENT, "yes"); //들여쓰기
			transformer.setOutputProperty(OutputKeys.DOCTYPE_PUBLIC, "yes");

			DOMSource source = new DOMSource(doc);
			StreamResult result = new StreamResult(new FileOutputStream(new File(strFile)));

			transformer.transform(source, result);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private String newLayout(String strPath) throws IOException {
		String strLayoutPath = new ClassPathResource("static/layout/").getPath();
		String strResourcePath = strLayoutPath + strPath + ".resources/";
		boolean bRet = true;
		try {
			Path resourcePath = Paths.get(strResourcePath);
			Files.createDirectory(resourcePath);
			writeLayout(strLayoutPath + strPath + ".xml");
		} catch (IOException e) {
			bRet = false;
		}
		HashMap<String, Object> hash = new HashMap<String, Object>();
		hash.put("cmd", "new-layout");
		hash.put("param", bRet ? "Ok" : "False");
		JSONObject obj = new JSONObject(hash);

		return obj.toString();
	}

	@ResponseBody
	@RequestMapping(value = "/req-list", produces = "application/json; charset=UTF-8")
	public String reqList(Model model, @RequestBody String param) {
		String strRet = "{}";
		ObjectMapper objectMapper = new ObjectMapper();
		try {
			JsonNode jsonObj = objectMapper.readTree(param);
			String strCmd = jsonObj.get("cmd").asText();

			if (strCmd.equals("font") == true) {
				strRet = getFontList();
			} else if (strCmd.equals("layout") == true) {
				strRet = getLayoutList();
			} else if (strCmd.equals("images") == true) {
				String strPath = jsonObj.get("param").asText();
				strRet = getImageList(strPath);
			} else if (strCmd.equals("del-image") == true) {
				JsonNode p = jsonObj.get("param");
				String strLayout = p.get("layout").asText();
				String strImage = p.get("image").asText();
				strRet = deleteImage(strLayout, strImage);
			} else if (strCmd.equals("del-layout") == true) {
				JsonNode p = jsonObj.get("param");
				String strLayout = (String) p.get("layout").asText();
				strRet = deleteLayout(strLayout);
			} else if (strCmd.equals("new-layout") == true) {
				JsonNode p = jsonObj.get("param");
				String strLayout = p.get("layout").asText();
				strRet = newLayout(strLayout);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return strRet;
	}

	@ResponseBody
	@RequestMapping(value = "/uploadImage/{layout}")
	public String uploadImage(@RequestParam("file") MultipartFile[] uploadFiles, @PathVariable("layout") String layout)
			throws IOException {

		for (MultipartFile mpf : uploadFiles) {
			String fileName = mpf.getOriginalFilename();

			String contextPath = "";
			if (layout.equals("preview") == true) {
				contextPath = "static/layout/" + fileName;
			} else {
				contextPath = "static/layout/" + layout + ".resources/" + fileName;
			}
			String realPath = new ClassPathResource(contextPath).getPath();
			mpf.transferTo(new File(realPath));
		}

		return "{success}";
	}

	@ResponseBody
	@RequestMapping(value = "/writeLayout/{layout}")
	public String writeLayout(Model model, @RequestBody String param, @PathVariable("layout") String layout) {
		String realPath = new ClassPathResource("static/layout/" + layout + ".xml").getPath();

		try {
			File file = new File(realPath);
			if (!file.exists()) {
				file.createNewFile();
			}
			BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file), "utf-8"));
			// FileWriter fw = new FileWriter(file);
			// BufferedWriter writer = new BufferedWriter(fw);
			writer.write(param);
			writer.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return "<?xml version=\"1.0\" encoding=\"UTF-8\"?><status>success</status>";
	}
}
