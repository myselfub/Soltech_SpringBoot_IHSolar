package kr.or.kwater.ihsolar.biznexus;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TcpAccess {
	protected final static Logger logger = LoggerFactory.getLogger(TcpAccess.class);
	Socket m_socket = null;
	private int m_cbBuff = 100 * 1024;

	public TcpAccess(int cbBuff) {
		m_cbBuff = cbBuff;

		long maxMemory = Runtime.getRuntime().maxMemory();
		if (maxMemory / 5000.0 > m_cbBuff)
			m_cbBuff = 10 * 1024 * 1024;
		else if (maxMemory / 500.0 > m_cbBuff)
			m_cbBuff = 1024 * 1024;
		// logger.info("Buffer(KB):" + m_cbBuff / 1024 + "/" + maxMemory / 1024);
	}

	public int connect(String strAddr, int nPort) {
		int nRet = -1;

		if (m_socket == null) {
			try {
				m_socket = new Socket();
				m_socket.setSoTimeout(3000);
				m_socket.setReuseAddress(true);
				m_socket.setSoLinger(true, 0);
				m_socket.connect(new InetSocketAddress(strAddr, nPort));
				nRet = 0;
			} catch (IOException ex) {
				nRet = -1;
				System.out.println("Connection fail: IOException");
			}
		}

		return nRet;
	}

	public int disconnect() {
		int nRet = -1;

		if (m_socket != null) {
			try {
				m_socket.close();
				m_socket = null;
				nRet = 0;
			} catch (IOException ex) {
				System.out.println("Disconnection fail: IOException");
			}
		}

		return nRet;
	}

	private void sendFrame(OutputStream sndSocket, String strFrame) {
		byte[] req = strFrame.getBytes();
		int len = (int) req.length;
		byte[] buff = new byte[6 + req.length];
		buff[0] = 'S';
		buff[1] = 'T';
		buff[2] = (byte) ((len / 65536) / 256);
		buff[3] = (byte) ((len / 65536) % 256);
		buff[4] = (byte) ((len % 65536) / 256);
		buff[5] = (byte) ((len % 65536) % 256);
		System.arraycopy(req, 0, buff, 6, len);

		try {
			sndSocket.write(buff);
		} catch (IOException ex) {
			System.out.println("IOException Occured");
			disconnect();
		}
	}

	private int makeLen(byte byData1, byte byData2, byte byData3, byte byData4) {
		int nData1 = (byData1 & 0xFF) * 256 + (byData2 & 0xFF);
		int nData2 = (byData3 & 0xFF) * 256 + (byData4 & 0xFF);

		return nData1 * 65536 + nData2;
	}

	private String recvFrame(InputStream rcvSocket) {
		String strRet = "";
		try {

			int cbLen = 0;
			ArrayList<Byte> frame = new ArrayList<>();
			while (true) {
				byte[] res = new byte[m_cbBuff];
				int nBytes = rcvSocket.read(res);
				if (nBytes <= 0) {
					disconnect();
					break;
				}
				for (int i = 0; i < nBytes; i++) {
					frame.add(res[i]);
					if (frame.size() == 1 && frame.get(0) == 'S')
						continue;
					if (frame.size() == 2 && frame.get(1) == 'T')
						continue;
					if (frame.size() >= 6)
						cbLen = makeLen(frame.get(2), frame.get(3), frame.get(4), frame.get(5));

					if (cbLen > 0 && cbLen + 6 == (int) frame.size())
						break;
				}

				if (cbLen > 0 && cbLen + 6 == (int) frame.size()) {
					// byte[] byteFrame = ArrayUtils.toPrimitive(frame.toArray(new Byte[0]));
					byte[] byteFrame = new byte[frame.size()];
					for (int i = 0; i < frame.size(); i++) {
						byteFrame[i] = (byte) frame.get(i);
					}
					byte[] byRet = new byte[byteFrame.length - 6];
					System.arraycopy(byteFrame, 6, byRet, 0, byRet.length);
					strRet = new String(byRet);
					break;
				}
			}

		} catch (IOException ex) {
			// ex.printStackTrace();
			disconnect();
		}

		return strRet;
	}

	public synchronized String exec(String strReq) {
		String strRet = "";
		if (m_socket != null && m_socket.isConnected() == true) {
			try {
				OutputStream sndSocket = m_socket.getOutputStream();
				InputStream rcvSocket = m_socket.getInputStream();

				sendFrame(sndSocket, strReq);
				strRet = recvFrame(rcvSocket);
			} catch (IOException ex) {
				ex.printStackTrace();
				disconnect();
			}
		}

		return strRet;
	}
}