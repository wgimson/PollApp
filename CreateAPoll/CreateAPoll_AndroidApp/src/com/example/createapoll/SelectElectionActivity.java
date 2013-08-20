package com.example.createapoll;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.ValueEventListener;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.provider.Settings.Secure;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

public class SelectElectionActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
	private DataSnapshot pollSnapshot = null;
//	private List<String> elections = new ArrayList<String>();
	private Spinner electionSpinner;
	private String selectedPoll;
//	private String selectedElection;
	private String voterName = "";
	private String androidId; 

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.select_election);
	    setTitle("Select an Election to Vote In");
	    selectedPoll = getIntent().getStringExtra("SELECTED_POLL_NAME").trim();
//	    phoneNumber = getPhoneNumber();
//	    Toast.makeText(getApplicationContext(), phoneNumber, Toast.LENGTH_LONG).show();
;
	    
		// Add all polls in ref as rows
		polls.addValueEventListener(new ValueEventListener() {
			@Override
			public void onDataChange(DataSnapshot snapshot) {
//				Toast.makeText(getApplicationContext(), 
//						"You selected: " + selectedPoll, Toast.LENGTH_LONG).show();
				electionSpinner = (Spinner) findViewById(R.id.election_name_spinner);
				List<String> electionNames = new ArrayList<String>();
				for (DataSnapshot child : snapshot.getChildren()) {
					if (!child.getName().equals("NumPolls")) {
						String pollName = child.child("Name").getValue(String.class).trim();
						if (isSelectedPoll(pollName)) {
							pollSnapshot = child;
							populateElectionNamesList(child, electionNames);
						}
					}
				}
				setSpinnerAdapter(electionSpinner, electionNames);
			}

			@Override
			public void onCancelled() {
				// TODO 
			}
		});
		
		Button btnSelectElection = (Button) findViewById(R.id.btn_select_election);
		btnSelectElection.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				if (pollSnapshot != null) {
					String selectedElection = getElectionName().trim();
					if (selectedElection != null) {
						DataSnapshot elections = pollSnapshot.child("Elections");
						for (DataSnapshot election : elections.getChildren()) {
							String electionName = election.child("Name").getValue(String.class).trim();
							if (electionName.equals(selectedElection)) {
								if (registeredToVote(election) && pollOpen(pollSnapshot)) {
									Intent castVoteIntent = new Intent(SelectElectionActivity.this, 
											CastVoteActivity.class);
									castVoteIntent.putExtra("VOTER_NAME", voterName);
									castVoteIntent.putExtra("POLL_NAME", selectedPoll);
									castVoteIntent.putExtra("ELECTION_NAME", selectedElection);
									castVoteIntent.putExtra("ANDROID_ID", androidId);
									startActivity(castVoteIntent);
								} 
							}
						}
					} else {
						// Error message
						Toast.makeText(getApplicationContext(), 
								"Please Select an Election", Toast.LENGTH_LONG).show();
					}
				}
//				Intent intentCastVote = new Intent(SelectElectionActivity.this, CastVoteActivity.class);
//				startActivity(intentCastVote);
				
			}
		});

	}
	
	private boolean registeredToVote(DataSnapshot election) {
		DataSnapshot voters = election.child("Voters");
		for (DataSnapshot voter : voters.getChildren()) {
			String voterDeviceId = voter.child("deviceID").getValue(String.class).trim();
//			String voterPhoneNum = voter.child("Number").getValue(String.class).trim();
//			Log.d("MY_DEBUG_MSG", "checking " + voterPhoneNum + " against " + getDeviceId().trim());
			if (voterDeviceId.equals(getDeviceId().trim()) && 
					voter.child("isActive").getValue(boolean.class)) {
				voterName = voter.child("name").getValue(String.class).trim();
//				Toast.makeText(getApplicationContext(), 
//						"Welcome, " + voter.child("name").getValue(String.class) 
//						+ "!", Toast.LENGTH_LONG).show();
				return true;
			} else if (!voter.child("isActive").getValue(boolean.class)) {
				Toast.makeText(getApplicationContext(), 
						"Sorry, you have already voted in this election", Toast.LENGTH_LONG).show();
			}
		}
		Toast.makeText(getApplicationContext(), 
				"Sorry, you are not registered to vote in this election - "
				+ "Contact your administrator.", Toast.LENGTH_LONG).show();
		return false;
	}
	
	private String getElectionName() {
		String electionName = electionSpinner.getSelectedItem().toString().trim();
		return electionName;
	}

	private String getDeviceId() {
	    androidId = Secure.getString(getContentResolver(), Secure.ANDROID_ID).trim();
//	    Toast.makeText(getApplicationContext(), androidId, Toast.LENGTH_LONG).show();
	    Log.d("ID", androidId);
		return androidId;
	}

	private boolean isSelectedPoll(String nm) {
		if (nm.equals(selectedPoll)) {
			return true;
		} 
		return false;
	}

	private void setSpinnerAdapter(Spinner electionSpinner, List<String> electionNames) {
		ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this, 
				android.R.layout.simple_spinner_item, electionNames);
		dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		electionSpinner.setAdapter(dataAdapter);
	}

	private void populateElectionNamesList(DataSnapshot poll, List<String> electionNames) {
		DataSnapshot elections = poll.child("Elections");
		for (DataSnapshot election : elections.getChildren()) {
			String electionName = election.child("Name").getValue(String.class);
			electionNames.add(electionName);
		}
	}
	
	private boolean pollOpen(DataSnapshot pollSnapshot) {
		DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
		Date dtNowDate = new Date();
		String startDate = pollSnapshot.child("StartDate").getValue(String.class);
		String endDate = pollSnapshot.child("EndDate").getValue(String.class);
		String nowDate = dateFormat.format(dtNowDate);
		String[] startDateArry = startDate.split("/");
		String[] endDateArry = endDate.split("/");
		String[] nowDateArry = nowDate.split("/");
		if (dateLessThan(nowDateArry, startDateArry) || dateGreaterThan(nowDateArry, endDateArry)) {
			Toast.makeText(getApplicationContext(), "Poll is active from: " + 
					startDate + ": " + endDate, Toast.LENGTH_SHORT).show();
			return false;
		}
		return true;
	}
	
	private boolean dateLessThan(String[] now, String[] start) {
		if (Integer.parseInt(now[2]) < Integer.parseInt(start[2])) {
			return true;
		} else if (Integer.parseInt(now[2]) == Integer.parseInt(start[2]) 
				&& Integer.parseInt(now[0]) < Integer.parseInt(start[0])) {
			return true;
		} else if (Integer.parseInt(now[2]) == Integer.parseInt(start[2]) 
				&& Integer.parseInt(now[0]) == Integer.parseInt(start[0])
				&& Integer.parseInt(now[1]) < Integer.parseInt(start[1])) {
			return true;
		}
		return false;
	}
	
	private boolean dateGreaterThan(String[] now, String[] end) {
		if (Integer.parseInt(now[2]) > Integer.parseInt(end[2])) {
			return true;
		} else if (Integer.parseInt(now[2]) == Integer.parseInt(end[2]) 
				&& Integer.parseInt(now[0]) > Integer.parseInt(end[0])) {
			return true;
		} else if (Integer.parseInt(now[2]) == Integer.parseInt(end[2]) 
				&& Integer.parseInt(now[0]) == Integer.parseInt(end[0])
				&& Integer.parseInt(now[1]) > Integer.parseInt(end[1])) {
			return true;
		}
		return false;
	}
}