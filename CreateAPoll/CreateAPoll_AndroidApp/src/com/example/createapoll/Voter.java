package com.example.createapoll;

public class Voter {
	private String Name;
	private String DeviceID;
	private boolean IsActive;
	
	public Voter() {}
	public Voter(String _name, String _dID) {
		this.Name = _name;
		this.DeviceID = _dID;
		this.IsActive = true;
	}
	
	public String getName() {
		return this.Name;
	}
	
	public String getDeviceID() {
		return this.DeviceID;
	}
	
	public boolean getIsActive() {
		return this.IsActive;
	}
}