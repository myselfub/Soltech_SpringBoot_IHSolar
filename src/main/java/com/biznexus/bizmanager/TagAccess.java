package com.biznexus.bizmanager;

public class TagAccess {
	public native int connect(String strHost1, String strHost2, int nPort);

	public native int close();

	public native String exec(String strCmd);
}