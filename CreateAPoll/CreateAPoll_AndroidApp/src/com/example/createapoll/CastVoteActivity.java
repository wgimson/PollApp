package com.example.createapoll;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.ValueEventListener;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.LinearLayout;
import android.widget.Toast;

public class CastVoteActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
	private String selectedPollName;
	private String selectedElectionName;
	private String voterName;
	private int numToElect;
	private List<String> nomineeNames = new ArrayList<String>();
	private List<Boolean> checked = new ArrayList<Boolean>();
	private DataSnapshot nominations;
	private DataSnapshot election;
	private String androidId;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.cast_vote);
	    
	    
	    selectedPollName = getIntent().getStringExtra("POLL_NAME").trim();
	    selectedElectionName = getIntent().getStringExtra("ELECTION_NAME").trim();
	    voterName = getIntent().getStringExtra("VOTER_NAME");
	    androidId = getIntent().getStringExtra("ANDROID_ID");
	    setTitle("Welcome, " + voterName + "! Cast a Vote!");
	    
	    polls.addValueEventListener(new ValueEventListener() {

			@Override
			public void onCancelled() {
				// TODO Auto-generated method stub
			}

			@Override
			public void onDataChange(DataSnapshot pollsSnapshot) {
				for (DataSnapshot pollSnapshot : pollsSnapshot.getChildren()) {

					if (!pollSnapshot.getName().equals("NumPolls")) {
						String pollName = pollSnapshot.child("Name").getValue(String.class).trim();
						if (pollName.equals(selectedPollName)) {
//							Toast.makeText(getApplicationContext(), pollName, Toast.LENGTH_LONG).show();
							DataSnapshot electionsSnapshot = pollSnapshot.child("Elections");
							for (DataSnapshot electionSnapshot : electionsSnapshot.getChildren()) {
								String electionName = electionSnapshot.child("Name").getValue(String.class).trim();
								if (electionName.equals(selectedElectionName)) {
//									LinearLayout layout = (LinearLayout) findViewById(R.id.cast_vote_linear_layout);
//									layout.removeAllViews();
									election = electionSnapshot;
									numToElect = Integer.parseInt(electionSnapshot.child("NumberToElect").getValue(String.class).trim());
									DataSnapshot nominationsSnapshot = electionSnapshot.child("Nominations");
									nominations = nominationsSnapshot;
									for (DataSnapshot nominationSnapshot : nominationsSnapshot.getChildren()) {
										String nomineeName = nominationSnapshot.child("Name").getValue(String.class).trim();
										nomineeNames.add(nomineeName);
										checked.add(false);
									}
									displayNomineeCheckBoxes(nomineeNames);
								}
								
							}
						}
					}
				}
			}
	    });
	}

	private void displayNomineeCheckBoxes(List<String> nominees) {
		LinearLayout layout = (LinearLayout) findViewById(R.id.cast_vote_linear_layout);
		for (String nominee : nominees) {
			CheckBox chkbxNominee = new CheckBox(this);
			chkbxNominee.setText(nominee);
			
			chkbxNominee.setOnCheckedChangeListener(new OnCheckedChangeListener() {

				@Override
				public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
					String btnName = buttonView.getText().toString().trim();
					toggleCheckedArrayEntry(btnName, isChecked);
					verifyNumNomineesSelected();
				}
			});
			layout.addView(chkbxNominee);
		}
		Button btnSubmitVote = new Button(this);
		btnSubmitVote.setText("Submit Votes");
		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.MATCH_PARENT, R.style.ButtonStyle);
		params.width = 400;
		params.leftMargin = 175;
		btnSubmitVote.setLayoutParams(params);
		btnSubmitVote.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				verifyNumNomineesSelectedToSubmit();
			}
		});
		layout.addView(btnSubmitVote);
		
	}
	
	private void verifyNumNomineesSelectedToSubmit() {
		int numChecked = 0;
		for (Boolean isChecked : checked) {
			if (isChecked) {
				numChecked++;
			}
		}
		if (numChecked == numToElect) {
			submitVotes();
			removeVoterFromElection();
			
		} else {
			Toast.makeText(getApplicationContext(), "You need to select " + numToElect 
					+ " candidates for this election!", Toast.LENGTH_SHORT).show();
		}
	}
	
	private void submitVotes() {
		Iterator<String> nomineeIter = nomineeNames.iterator();
		for (boolean isChecked : checked) {
			if (isChecked) {
				if (nomineeIter.hasNext()) {
					String nomineeName = (String) nomineeIter.next().trim();

					for (DataSnapshot nomination : nominations.getChildren()) {
						String nomineeSnapshotName = nomination.child("Name").getValue(String.class).trim();
						if (nomineeSnapshotName.equals(nomineeName)) {
							int curNumVotes = nomination.child("NumberOfVotes").getValue(Integer.class);
							Firebase nomineeVotesRef = nomination.child("NumberOfVotes").getRef();
							nomineeVotesRef.setValue(++curNumVotes);
						}
					}
				} else {
					// THROW ERROR
					Toast.makeText(getApplicationContext(), "Vote Error", Toast.LENGTH_LONG).show();
				}
			} else {
				if (nomineeIter.hasNext()) {
					nomineeIter.next();
				}
			}
		}
		Intent restartHomePage = new Intent(CastVoteActivity.this, PollResultsActivity.class);
		startActivity(restartHomePage);
	}

	private void verifyNumNomineesSelected() {
		int numChecked = 0;
		for (Boolean isChecked : checked) {
			if (isChecked) {
				numChecked++;
			}
		}
		Toast.makeText(getApplicationContext(), "You've checked: " + numChecked + 
				" boxes, and you need to check: " + numToElect, Toast.LENGTH_SHORT).show();
	}

	private void toggleCheckedArrayEntry(String btnName, boolean isChecked) {
		int chkboxIndex = nomineeNames.indexOf(btnName.trim());
		if (chkboxIndex != -1) {
			checked.set(chkboxIndex, isChecked);
		}
	}
	
	private void removeVoterFromElection() {
		DataSnapshot voters = election.child("Voters");
		for (DataSnapshot voter : voters.getChildren()) {
			// TODO change 'Number' in database schema to 'VoterDeviceID'
//			String id = voter.child("Number").getValue(String.class).trim();
			String voterDeviceId = voter.child("deviceID").getValue(String.class).trim();
			if ((voterDeviceId).equals(androidId.trim())) {
//				Toast.makeText(getApplicationContext(), "Found voter " + 
//						voter.child("Name").getValue(String.class) + 
//						" about to remove", Toast.LENGTH_LONG).show();
				voter.child("isActive").getRef().setValue(false);
//				voter.getRef().removeValue();
			}
		}
	}
}