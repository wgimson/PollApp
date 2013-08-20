package com.example.createapoll;

import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.ValueEventListener;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings.Secure;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

public class RegisterUserActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
	private String selectedElectionName; 
	private String selectedPollName;
	private String userName;
	private boolean voterAdded;
	

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    voterAdded = false;
	    setContentView(R.layout.register_user_layout);
	    selectedPollName = getIntent().getStringExtra("SELECTED_POLL_NAME").trim();
	    selectedElectionName = getIntent().getStringExtra("SELECTED_ELECTION_NAME").trim();
	}
	
	public void registerUser(View view) {
		EditText editTxtUserName = (EditText) findViewById(R.id.editTextRegisterName);
		userName = editTxtUserName.getText().toString().trim();
		if (userName != null && !userName.equals("")) {
//			Toast.makeText(getApplicationContext(), "Congratulations: " 
//					+ userName + "!", Toast.LENGTH_SHORT).show();
			
			// Add all polls in ref as rows
			polls.addValueEventListener(new ValueEventListener() {
				@Override
				public void onDataChange(DataSnapshot snapshot) {
					for (DataSnapshot pollsChild : snapshot.getChildren()) {
						if (!pollsChild.getName().equals("NumPolls")) {
							String pollName = pollsChild.child("Name").getValue(String.class).trim();
							if (pollName.equals(selectedPollName)) {
								DataSnapshot elections = pollsChild.child("Elections");
								for (DataSnapshot election : elections.getChildren()) {
									String electionName = election.child("Name").getValue(String.class).trim();
									if (electionName.equals(selectedElectionName)) {
										if (!voterAdded) {
											int numVoters = election.child("NumVoters").getValue(int.class);
											numVoters++;
											voterAdded = true;
											String deviceId = getDeviceId();
											if (!voterRegistered(deviceId, election.child("Voters")) /*&& 
													voterIsActive(deviceId, election.child("Voters"))*/) {
												Voter voter = new Voter(userName, deviceId);
												Firebase voterRef = election.getRef().child("Voters");
												voterRef.push().setValue(voter);
												election.child("NumVoters").getRef().setValue(numVoters);
												Toast.makeText(getApplicationContext(), "Congratulations, "
														+ " you're registered, " + userName + "!", 
														Toast.LENGTH_SHORT).show();
											} else {
												Toast.makeText(getApplicationContext(), "Hey" + userName +
														", you've already registered, what's the idea?!", 
														Toast.LENGTH_SHORT).show();
											}
											Intent homeIntent = new Intent(RegisterUserActivity.this, 
													PollResultsActivity.class);
											startActivity(homeIntent);
										}
									}
								}
							}
						}
					}
				}
				
				public void onCancelled() {
					
				}
			});
			
		} else {
			Toast.makeText(getApplicationContext(), "Error: " 
					+ "null entry!", Toast.LENGTH_SHORT).show();
		}
	}
	
	private String getDeviceId() {
		String androidId = Secure.getString(getContentResolver(), Secure.ANDROID_ID).trim();
		return androidId;
	}
	
	private boolean voterRegistered(String deviceId, DataSnapshot voters) {
		for (DataSnapshot voter : voters.getChildren()) {
			String voterDeviceId = voter.child("deviceID").getValue(String.class).trim();
			if (voterDeviceId.equals(deviceId)) {
				return true;
			}
		}
		return false;
	}
}