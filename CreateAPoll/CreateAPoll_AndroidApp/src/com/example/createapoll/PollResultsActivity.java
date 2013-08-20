package com.example.createapoll;

import java.util.Random;
import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.ValueEventListener;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActionBar.LayoutParams;
import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

public class PollResultsActivity extends Activity {
	private static final Firebase pollsFirebase = new Firebase("https://poll-database.firebaseio.com/");
	private static final Firebase polls = pollsFirebase.child("Polls");
//	private static int rowCount = 0;
	private static int pollCount = 0;

	@SuppressLint("InlinedApi")
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.poll_table);	
		setTitle("Welcome to Poll App!\nVote, Register or Observe Election Results!");
		
		// Add all polls in ref as rows
		polls.addValueEventListener(new ValueEventListener() {
			private void clearLayout() {
				LinearLayout baseLayout = (LinearLayout) findViewById(R.id.linearLayout);
				baseLayout.removeAllViews();
			}

			@Override
			public void onDataChange(DataSnapshot snapshot) {
				clearLayout();
				createVoteButton();
				createRegisterButton();
				for (DataSnapshot child : snapshot.getChildren()) {
					if (!child.getName().equals("NumPolls")) {
						createPollTableAndHeaders(child);
					}
				}
			}
			
			@Override
			public void onCancelled() {
				
			}
		});
	}
	
	private void createVoteButton() {
		// Create the new button 
		Button btnVote = new Button(this);
		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT, 
				R.style.ButtonStyle);
//		params.setMargins(25,  0,  25,  0);
		params.width = 380;
		params.leftMargin = 175;
		btnVote.setLayoutParams(params);
		btnVote.setText("VOTE");
//		btnVote.setTextSize(10);
		LinearLayout layout = (LinearLayout) findViewById(R.id.linearLayout);
		btnVote.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
//					Toast.makeText(getApplicationContext(), "Button Clicked!", Toast.LENGTH_SHORT).show();
				Intent launchVoteActivity = new Intent(PollResultsActivity.this, VoteActivity.class);

				startActivity(launchVoteActivity);
			}
		});
		layout.addView(btnVote);
	}
	
	private void createRegisterButton() {
		// Create the new button
		Button btnRegister = new Button(this);
		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
				LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT,
				R.style.ButtonStyle);
		params.width = 380;
		params.leftMargin = 175;
		btnRegister.setLayoutParams(params);
		btnRegister.setText("REGISTER");
//		btnRegister.setTextSize(10);
		LinearLayout layout = (LinearLayout) findViewById(R.id.linearLayout);
		btnRegister.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				Intent launchRegisterActivity = new Intent(PollResultsActivity.this, RegisterActivity.class);
				startActivity(launchRegisterActivity);
			}
		});
		layout.addView(btnRegister);
	}
	
	@SuppressLint("NewApi")
	private void createPollTableAndHeaders(DataSnapshot poll) {
		// Create new table
		TableLayout tbl = new TableLayout(this);
		
		// Create table header with poll name
		TableRow pollHeader = new TableRow(this);
		pollHeader.setId(pollCount+1);
		pollHeader.setBackgroundColor(Color.BLACK);
		pollHeader.setLayoutParams(new TableRow.LayoutParams(
				LayoutParams.MATCH_PARENT,
				LayoutParams.WRAP_CONTENT));
		
		String pollName = poll.child("Name").getValue(String.class);

		// Assign poll name
		TextView pollNameView = new TextView(this);
		pollNameView.setId(pollCount+1);
		pollNameView.setText(pollName);
		pollNameView.setTextColor(Color.WHITE);
		pollNameView.setPadding(5, 5, 5, 5);
		pollHeader.addView(pollNameView);
		
		tbl.addView(pollHeader);
		
		DataSnapshot elections = poll.child("Elections");
		appendElectionsToTable(elections, tbl);
		
		// Add to LinearLayout
		LinearLayout layout = (LinearLayout) findViewById(R.id.linearLayout);
		layout.addView(tbl);
		
		// Increment poll count
		pollCount++;
	}
	
	@SuppressLint("NewApi")
	private void appendElectionsToTable(DataSnapshot elections, TableLayout tbl) {
		for (DataSnapshot election : elections.getChildren()) {
			String electionName = election.child("Name").getValue(String.class);
			
			TableRow electionHeader = new TableRow(this);
			electionHeader.setId(pollCount+1);
			electionHeader.setBackgroundColor(Color.DKGRAY);
			electionHeader.setLayoutParams(new TableRow.LayoutParams(
					LayoutParams.MATCH_PARENT,
					LayoutParams.WRAP_CONTENT));
			
			TextView viewElectionName = new TextView(this);
			viewElectionName.setId(2);
			viewElectionName.setText(electionName);
			viewElectionName.setTextColor(Color.BLACK);
			viewElectionName.setPadding(5, 5, 5, 5);
			electionHeader.addView(viewElectionName);
			
			tbl.addView(electionHeader);
			appendCandidateAndVotesHeaderToTable(tbl);
			
			appendCandidatesAndVotes(election, tbl);
		}
	}
	
	@SuppressLint("NewApi")
	private void appendCandidateAndVotesHeaderToTable(TableLayout tbl) {
		// Create table header with Candidate and Voter headers
		TableRow rowCandidateAndVoterHeader = new TableRow(this);
		rowCandidateAndVoterHeader.setId(pollCount+1);
		rowCandidateAndVoterHeader.setBackgroundColor(Color.LTGRAY);
		rowCandidateAndVoterHeader.setLayoutParams(new TableRow.LayoutParams(
				LayoutParams.MATCH_PARENT,
				LayoutParams.WRAP_CONTENT));
		
		// Create Candidate header
		TextView candidateName = new TextView(this);
		candidateName.setId(2);
		candidateName.setText("Candidate");
		candidateName.setTextColor(Color.BLACK);
		candidateName.setPadding(5, 5, 5, 5);
		rowCandidateAndVoterHeader.addView(candidateName);
		
		// Create number of votes header
		TextView numVotes = new TextView(this);
		numVotes.setId(3);
		numVotes.setText("Number of Votes");
		numVotes.setTextColor(Color.BLACK);
		numVotes.setPadding(5,  5,  5,  5);
		rowCandidateAndVoterHeader.addView(numVotes);
		
		// Add to TableLayout
		tbl.addView(rowCandidateAndVoterHeader);
	}
	
	@SuppressLint("InlinedApi")
	private void appendCandidatesAndVotes(DataSnapshot election, TableLayout tbl) {
		Random randGen = new Random();
		DataSnapshot nominees = election.child("Nominations");
		for (DataSnapshot nominee : nominees.getChildren()) {

			// Create row for candidate name and number of votes
			TableRow rowNameAndVotes = new TableRow(this);
			// Generating a random row ID here allows us to pass this to 
			// the valueEventListener and quickly locate this row in 
			// the case of a data change (someone has cast a vote) so we 
			// can update
			int uniqueRowId = randGen.nextInt(1000);
			rowNameAndVotes.setId(uniqueRowId);
			rowNameAndVotes.setBackgroundColor(Color.WHITE);
			rowNameAndVotes.setLayoutParams(new TableRow.LayoutParams (
					LayoutParams.MATCH_PARENT,
					LayoutParams.WRAP_CONTENT));
			
			// Create candidate name view
			TextView viewCandidateName = new TextView(this);
			viewCandidateName.setId(2);
			viewCandidateName.setText(nominee.child("Name").getValue(String.class));
			viewCandidateName.setTextColor(Color.BLACK);
			viewCandidateName.setPadding(5,  5,  5, 5);
			rowNameAndVotes.addView(viewCandidateName);
			
			// Create number of votes view
			TextView viewNumVotes = new TextView(this);
			viewNumVotes.setId(3);
			viewNumVotes.setText(nominee.child("NumberOfVotes").getValue(String.class));
			viewNumVotes.setTextColor(Color.BLACK);
			viewNumVotes.setPadding(3,  5,  5,  5);
			rowNameAndVotes.addView(viewNumVotes);
			
			// Add row to table
			tbl.addView(rowNameAndVotes);
		}
	}
	
	@Override
	protected void onStop() {
		super.onStop();
	}
}