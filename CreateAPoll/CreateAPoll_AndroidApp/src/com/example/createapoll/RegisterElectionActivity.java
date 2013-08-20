package com.example.createapoll;

import java.util.ArrayList;
import java.util.List;

import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.ValueEventListener;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

public class RegisterElectionActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
	private Spinner electionSpinner; 
	private String selectedPollName;
	private String pollKey;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.register_election_layout);
	    setTitle("Select Election to Register For");
	    selectedPollName = getIntent().getStringExtra("SELECTED_POLL_NAME").trim();
	    
	    // Add all polls in ref as rows
		polls.addValueEventListener(new ValueEventListener() {
			@Override
			public void onDataChange(DataSnapshot snapshot) {
				electionSpinner = (Spinner) findViewById(R.id.spinner_select_register_election);
				List<String> electionNames = new ArrayList<String>();
				for (DataSnapshot child : snapshot.getChildren()) {
					if (!child.getName().equals("NumPolls")) {
						String pollName = child.child("Name").getValue(String.class).trim();
						pollKey = child.child("Key").getValue(String.class).trim();
						if (isSelectedPoll(pollName)) {
							populateElectionNamesList(child, electionNames);
						}
					}
				}
				setSpinnerAdapter(electionSpinner, electionNames);
//				addListenerOnSpinnerItemSelection();
			}
			
			@Override
			public void onCancelled() {
				
			}
		});
	}

	protected void populateElectionNamesList(DataSnapshot selectedPoll,
			List<String> electionNames) {
		DataSnapshot elections = selectedPoll.child("Elections");
		for (DataSnapshot election : elections.getChildren()) {
			String electionName = election.child("Name").getValue(String.class);
			electionNames.add(electionName);
		}
	}
	
	private void setSpinnerAdapter(Spinner electionSpinner, List<String> electionNames) {
		ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this, 
				android.R.layout.simple_spinner_item, electionNames);
		dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		electionSpinner.setAdapter(dataAdapter);
	}
	
	private boolean isSelectedPoll(String nm) {
		if (nm.equals(selectedPollName)) {
			return true;
		} 
		return false;
	}
	
	public void registerVoter(View view) {
		EditText txtKey = (EditText) findViewById(R.id.edit_poll_key);
		
		if (pollKey.equals(txtKey.getText().toString())) {
			String selectedElectionName = getSelectedElectionName();
			Toast.makeText(getApplicationContext(), "Welcome!", Toast.LENGTH_SHORT).show();
			Intent registerVoterIntent = new Intent(RegisterElectionActivity.this, 
					RegisterUserActivity.class);
			registerVoterIntent.putExtra("SELECTED_POLL_NAME", selectedPollName);
			registerVoterIntent.putExtra("SELECTED_ELECTION_NAME", selectedElectionName);
			startActivity(registerVoterIntent);	
		}
	}
	
	private String getSelectedElectionName() {
		String electionName = electionSpinner.getSelectedItem().toString().trim();
		return electionName;
	}
}