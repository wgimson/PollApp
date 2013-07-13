///////////////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////////////
function setCurPhoneNumber() 
{
	var phoneNumber = "5555215554"; //interface.getPhoneNumber();
	return phoneNumber;
}

function hidePolls()
{
	$('div#divPollListing').hide();
}

function hideElections()
{
	$('div#divElectionListing').hide();
}

function showElections()
{
	$('div#divElectionListing').show();
}

function hideNominees()
{
	$('div#divNomineeListing').hide();
}

function showNominees()
{
	$('div#divNomineeListing').show();
}

function hideNomineeSuccessMessages()
{
	$('div#divNomineeListing div.formee-msg-success').hide();
}

function showNomineeSuccessMessages()
{
	$('div#divNomineeListing div.formee-msg-success').show();
}

function hideNomineeInfoMessages()
{
	$('div#divNomineeListing div.formee-msg-info').hide();
}

function showNomineeInfoMessages()
{
	$('div#divNomineeListing div.formee-msg-info').show();
}

function emptyOldNomineeSuccessMessages() 
{
	$('div#divNomineeListing div.formee-msg-success').empty();
}

function emptyOldNomineeInfoMessages()
{
	$('div#divNomineeListing div.formee-msg-info').empty();
}

function appendPolls(nm) 
{
	$('div#divPollListing').append('<h2>' + nm + "</h2><br /><br />");
}

function hidePollsShowElections()
{
	$('div#divPollListing').hide();
	$('div#divElectionListing').slideDown('slow');
}

function hideElectionsShowNominees()
{
	$('div#divElectionListing').hide();
	$('div#divNomineeListing').slideDown('slow');
}

function clearOldPollContents()
{
	$('div#divPollListing div#polls').empty();
}

function hideNomineesShowPolls()
{
	$('div#divNomineeListing').hide();
	$('div#divPollListing').show();	
}

function clearElectionAndNomineeDivContents()
{
	$('div#divNomineeListing div#nominees').empty();
	$('div#divElectionListing div#elections').empty();
	$('div#divElectionListing div.formee-msg-success').empty();	
	$('div#divElectionListing div.formee-msg-info').empty();	
}

function selectPoll(curPoll, phoneNumber) 
{
	hidePolls();
	showElections();
	curPoll.once('value', function(curPollSnapshot) {
		curPollSnapshot.forEach(function(child) {
			var type = child.name();
			if (type == "Name" || type == "NumElections" || type == "NumVoters") 
			{
				// Do nothing
				;
			}
			else 
			{
				// Here we know that the only third type of child is an 'Election' child
				var elections = curPoll.child(type);
				elections.once('value', function(electionsSnapshot) {
					electionsSnapshot.forEach(function(child) {
						var curElection = child.name();
						var curElectionObj = child.val();
						var curElectionName = curElectionObj.Name;
						var btnPoll = document.createElement('button');
						var txt = document.createTextNode(curElectionName);
						btnPoll.appendChild(txt);
						btnPoll.addEventListener('click', function(e) {
							e.preventDefault();
							verifyCurrentElectionOpenAndSelectElection(elections, curElection, phoneNumber);
						});
						$('div#divElectionListing div#elections').append(btnPoll);
						$('div#divElectionListing div#elections > button').addClass('formee-button');
					});
				});
			}
		});
	});
	hidePollsShowElections();
}

function verifyCurrentElectionOpenAndSelectElection(elections, currentElection, phoneNumber)
{
	verifyCurrentElectionOpen(elections, currentElection, phoneNumber);
}

/*function verifyVoterAndSelectPoll(currentPollName, phoneNumber) 
{
	currentPoll = polls.child(currentPollName);
	currentPoll.once('value', function(curPollSnapshot) {
		curPollSnapshot.forEach(function(curPollChild) {
			var type = curPollChild.name();
			if (type == "Elections" || type == "Name" || type == "NumElections") 
			{
				;
				// Do nothing
			}
			else 
			{
				var votersRef = currentPoll.child(type);
				votersRef.once('value', function(votersSnapshot) {
					votersSnapshot.forEach(function(votersChild) {
						if (votersChild.val().Number == phoneNumber)
						{
							alert("Welcome " + votersChild.val().Name);
							selectPoll(currentPoll, votersChild.name());
						}
					});
				});
			}
		});
	});
}*/

function selectElection(nm, phoneNumber, elections)
{
	var currentElectionRef = elections.child(nm);
	currentElectionRef.once('value', function(curElectionSnapshot) {
		curElectionSnapshot.forEach(function(nominationsChild) {
			var type = nominationsChild.name();
			if (type != "Nominations")  
			{
				// Do nothing
				;
			}
			else
			{
				nominationsChild.forEach(function(nominationChild) {
					var nominationChildName = nominationChild.val().Name;
					var btnNominee = document.createElement('button');
					var txt = document.createTextNode(nominationChildName);
					btnNominee.appendChild(txt);
					btnNominee.addEventListener('click', function(e) {
						e.preventDefault();
						commitVote(currentElectionRef, phoneNumber, nominationChild.ref());
					});
					$('div#divNomineeListing div#nominees').append(btnNominee);
					$('div#divNomineeListing div#nominees > button').addClass('formee-button');
				});
			}
		});
	});
	hideElectionsShowNominees();
}

function verifyCurrentElectionOpen(elections, curElectionName, phoneNumber)
{
	var currentElectionsRef = elections.child(curElectionName);
	var votersRef = currentElectionsRef.child('Voters');
	votersRef.once('value', function(votersSnapshot) {
		votersSnapshot.forEach(function(voter) {
			var voterPhoneNumber = voter.val().Number;
			if (voterPhoneNumber == parseInt(phoneNumber.trim()))
			{
				$('div#divNomineeListing legend').text("Welcome, " + voter.val().Name + 
					"! Please Submit a Vote!");
				hideElections();
				showNominees();
				hideNomineeSuccessMessages();
				hideNomineeInfoMessages();
				selectElection(currentElectionsRef.name(), phoneNumber, elections);
			}
		});
	});
}

function commitVote(currentElectionRef, phoneNumber, nominationRef)
{
    nominationRef.once('value', function (nominationSnapshot) {
        var numVotes = nominationSnapshot.val().NumberOfVotes;
        var nomineeName = nominationSnapshot.val().Name;
        var snapshotName = nominationSnapshot.name();
        var nomination = currentElectionRef.child('Nominations').child(snapshotName);
        currentElectionRef.once('value', function(curElectionSnapshot) {
            var numberToElect = curElectionSnapshot.val().NumberToElect;
            var numVoters = curElectionSnapshot.val().NumVoters;
            if (numberToElect <= numVotedFor)
            {
                alert("Sorry, you have already voted for " + numberToElect + " candidates in this election.");
                numVotedFor = 0;	
                removeElectionForVoter(currentElectionRef, curElectionSnapshot, phoneNumber, numVoters);
                clearElectionAndNomineeDivContents();
                hideNomineesShowPolls();
                return;
            }

            numVotes++;
            nomination.update({NumberOfVotes: numVotes});
            numVotedFor++;
            //alert("Vote for " + nomineeName + " submitted!");
            emptyOldNomineeSuccessMessages();
            $('div#divNomineeListing div.formee-msg-success').append("<h3>Your Vote for " + nomineeName 
                                + " has Been Submitted!</h3>");
            showNomineeSuccessMessages();
            if (numberToElect <= numVotedFor) {
                //alert("Thank you for voting!");
                // Reset the number to 0
                numVotedFor = 0;
                removeElectionForVoter(currentElectionRef, curElectionSnapshot, phoneNumber, numVoters);
                clearElectionAndNomineeDivContents();
                hideNomineesShowPolls();
                return;
            }
            else 
            {
                //alert("You still have " + (parseInt(numberToElect) - parseInt(numVotedFor)) + " vote(s) to cast");
                emptyOldNomineeInfoMessages();
                $('div#divNomineeListing div.formee-msg-info').append("<h3>You still have " + 
                        (parseInt(numberToElect) - parseInt(numVotedFor)) + " vote(s) to cast!");
                showNomineeInfoMessages();
                return;
            }
        });
    });
}

function removeElectionForVoter(currentElectionRef, currentElectionSnapshot, phoneNumber, numVoters)
{
	var votersRef = currentElectionRef.child('Voters');
	votersRef.once('value', function(votersSnapshot) {
		votersSnapshot.forEach(function(voter) {
			var voterPhoneNumber = voter.val().Number;
			if (voterPhoneNumber == parseInt(phoneNumber.trim())) 
			{
				//alert("Removed voter " + voter.val().Name + " from election " 
					//+ currentElectionSnapshot.val().Name);
				voterRef = votersRef.child(voter.name());
				voterRef.remove();
				numVoters--;
				currentElectionRef.update({NumVoters: numVoters})
				/*$('div#divNomineeListing div#nominees').append("<div class='formee-msg-success'>" +
					 "<h3>Thank You for Voting, " + voter.val().Name + "</h3></div>");*/
			}
		});

	});
}
// We must keep numVotedFor until we call a function which takes us out of the 
// current election, at which time it will be set back to 0