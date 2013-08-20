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
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

public class RegisterActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
	private Spinner pollSpinner; 
	private String pollKey = "";
//	private String selectedPollName = "";

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setTitle("Select a Poll to Register For");
	    setContentView(R.layout.register_layout);
	    
		 // Add all polls in ref as rows
		polls.addValueEventListener(new ValueEventListener() {
			@Override
			public void onDataChange(DataSnapshot snapshot) {
				pollSpinner = (Spinner) findViewById(R.id.spinner_select_register_poll);
				List<String> pollNames = new ArrayList<String>();
				for (DataSnapshot child : snapshot.getChildren()) {
					if (child.getName().equals("Key")) {
						pollKey = child.getValue(String.class).trim();
					} else if (!child.getName().equals("NumPolls")) {
						populatePollNamesList(child, pollNames);
					}
				}
				setSpinnerAdapter(pollSpinner, pollNames);
//				addListenerOnSpinnerItemSelection();
			}
			
			@Override
			public void onCancelled() {
				
			}
		});
		
		Button btnSelectRegisterPoll = (Button) findViewById(R.id.btn_select_register_poll);
		btnSelectRegisterPoll.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				if (getPollName() != "") {
//					Toast.makeText(getApplicationContext(), "You've Selected Poll: " 
//							+ getPollName(), Toast.LENGTH_SHORT).show();
					Intent intentSelectRegisterElection = new Intent(RegisterActivity.this, RegisterElectionActivity.class);
					intentSelectRegisterElection.putExtra("SELECTED_POLL_NAME", getPollName());
					intentSelectRegisterElection.putExtra("POLL_KEY", pollKey);
					startActivity(intentSelectRegisterElection);
				} else {
					Toast.makeText(getApplicationContext(), "Please Select a Poll!", 
							Toast.LENGTH_SHORT).show();
				}
			}
		});
	}
	
	private String getPollName() {
		String pollName = pollSpinner.getSelectedItem().toString().trim();
		return pollName;
	}
	
	protected void addListenerOnSpinnerItemSelection() {

		pollSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

			@Override
			public void onItemSelected(AdapterView<?> parent, View view,
					int pos, long id) {
//				pollSpinner = (Spinner) findViewById(R.id.poll_name_spinner);
//				selectedPollName = pollSpinner.getSelectedItem().toString();
			}

			@Override
			public void onNothingSelected(AdapterView<?> arg0) {
				// DO NOTHING
			}
		});
	}
	
	protected void setSpinnerAdapter(Spinner spinner, List<String> pollNames) {
		ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(this, 
				android.R.layout.simple_spinner_item, pollNames);
		dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		pollSpinner.setAdapter(dataAdapter);
	}
	
	protected void populatePollNamesList(DataSnapshot poll, List<String> pollNames) {
		String pollName = poll.child("Name").getValue(String.class);
		pollNames.add(pollName);
	}
}