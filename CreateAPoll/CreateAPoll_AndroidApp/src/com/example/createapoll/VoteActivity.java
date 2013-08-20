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

public class VoteActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
	private Spinner pollSpinner;
	private String selectedPollName = ""; 

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.vote);
	    setTitle("Select a Poll to Vote In");
	    
		// Add all polls in ref as rows
		polls.addValueEventListener(new ValueEventListener() {
			@Override
			public void onDataChange(DataSnapshot snapshot) {
				pollSpinner = (Spinner) findViewById(R.id.poll_name_spinner);
				List<String> pollNames = new ArrayList<String>();
				for (DataSnapshot child : snapshot.getChildren()) {
					if (!child.getName().equals("NumPolls")) {
//						populatePollsSpinner(child);
						populatePollNamesList(child, pollNames);
					}
				}
				setSpinnerAdapter(pollSpinner, pollNames);
				addListenerOnSpinnerItemSelection();
			}

			@Override
			public void onCancelled() {
				// TODO 
			}
		});
		
		Button btnSelectPoll = (Button) findViewById(R.id.btnSelectPoll);
		btnSelectPoll.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				if (selectedPollName != "") {
//					Toast.makeText(getApplicationContext(), "You've Selected Poll: " 
//							+ selectedPollName, Toast.LENGTH_SHORT).show();
					Intent intentSelectElection = new Intent(VoteActivity.this, SelectElectionActivity.class);
					intentSelectElection.putExtra("SELECTED_POLL_NAME", selectedPollName);
					startActivity(intentSelectElection);
				} else {
					Toast.makeText(getApplicationContext(), "Please Select a Poll!", 
							Toast.LENGTH_SHORT).show();
				}
			}
		});
	}

	protected void addListenerOnSpinnerItemSelection() {

		pollSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

			@Override
			public void onItemSelected(AdapterView<?> parent, View view,
					int pos, long id) {
				pollSpinner = (Spinner) findViewById(R.id.poll_name_spinner);
				selectedPollName = pollSpinner.getSelectedItem().toString();
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