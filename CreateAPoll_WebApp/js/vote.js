///////////////////////////////////////////////////////////////////
// FUNCTIONS 
///////////////////////////////////////////////////////////////////
function findPollByName(pollsRef, pollName) {
    pollsRef.once('value', function (pollsSnapshot) {
        pollsSnapshot.forEach(function (poll) {
            if ($.trim(pollsRef.name()) !== "NumPolls") {
                var foundPollName = $.trim(poll.val().Name);
                if (foundPollName === $.trim(pollName)) {
                    var pollRef = poll.ref();
                    return pollRef;
                }
            }
        });
    });
}

//function getPollByName(pollRef, pollName) {
//    var foundPollName = $.trim(poll.val().Name);
//    if (foundPollName === $.trim(pollName)) {
//        var pollRef = poll.ref();
//        return pollRef;
//    } else {
//        return "";
//    }
//} 

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

function hideNomineeErrorMessages() {
    $('div#divNomineeListing div.formee-msg-error').hide();
}

function showNomineeErrorMessages() {
    $('div#divNomineeListing div.formee-msg-error').show();
}

function emptyOldNomineeSuccessMessages() 
{
	$('div#divNomineeListing div.formee-msg-success').empty();
}

function emptyOldNomineeInfoMessages()
{
	$('div#divNomineeListing div.formee-msg-info').empty();
}

function emptyOldNomineeErrorMessages() {
    $('div#divNomineeListing div.formee-msg-error').empty();
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
	curPoll.once('value', function (curPollSnapshot) {
	    var selectElection = $('<select></select>');
	    selectElection.attr({ 'class': 'formee-small' });
	    var btnSubmitElection = $('<button>SELECT ELECTION</button>');
	    btnSubmitElection.attr({ 'class': 'formee-button' });
	    btnSubmitElection.click(function () {
	        curPollSnapshot.forEach(function (child) {
	            var type = $.trim(child.name());
	            if (type !== "Name" && type !== "NumElections" && type !== "NumVoters") {
	                var elections = curPoll.child(type);
	                elections.once('value', function (electionsSnapshot) {
	                    electionsSnapshot.forEach(function (child) {
	                        var selectedElectionName = $.trim($('div#divElectionListing div#elections select').find(':selected').text());
	                        var electionName = $.trim(child.val().Name);
	                        if (electionName === selectedElectionName) {
	                            verifyCurrentElectionOpenAndSelectElection(elections, child.name(), phoneNumber);
	                        }
	                    });
	                });
	            }
	        });
	        return false;
	    });
	    $('div#divElectionListing div#elections').append(selectElection);
	    $('div#divElectionListing div#elections').append(btnSubmitElection);
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
						//var btnPoll = document.createElement('button');
						//var txt = document.createTextNode(curElectionName);
						//btnPoll.appendChild(txt);
						//btnPoll.addEventListener('click', function(e) {
						//	e.preventDefault();
						//	verifyCurrentElectionOpenAndSelectElection(elections, curElection, phoneNumber);
						//});
						//$('div#divElectionListing div#elections').append(btnPoll);
					    //$('div#divElectionListing div#elections > button').addClass('formee-button');
						var electOption = $('<option>' + curElectionName + '</option>');
						selectElection.append(electOption);
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

function selectElection(nm, phoneNumber, elections, numberToElect)
{
    var currentElectionRef = elections.child(nm);
    currentElectionRef.once('value', function (curElectionSnapshot) {
        var numChecked;
        var ul = $('<ul></ul>');
        ul.attr({
            'class': 'formee-list'
        });
	    curElectionSnapshot.forEach(function (nominationsChild) {
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
					//var btnNominee = document.createElement('button');
					//var txt = document.createTextNode(nominationChildName);
				    //btnNominee.appendChild(txt);
					var li = $('<li></li>');
					var chkbx = $('<input></input>');
					chkbx.attr({
					    type: 'checkbox',
                        name: 'chkbxNominee'
					});
					chkbx.click(function () {
					    numChecked = 0;
					    $(this).closest('ul').children('li').children('input[type=checkbox]:checked').each(function () {
					        numChecked++;
					    });
					    displayNomineeSelectedMessage(numChecked, numberToElect);
					    //if (numChecked < numberToElect) {
					    //    //commitVote(currentElectionRef, phoneNumber, nominationChild.ref());
					    //    alert("you still must select " + (parseInt(numberToElect) - parseInt(numChecked)));
					    //} else if (numChecked > numberToElect) {
					    //    //commitVote(currentElectionRef, phoneNumber, nominationChild.ref());
					    //    alert("You may only select " + numberToElect); 
					    //} else {
					    //    //commitVote(currentElectionRef, phoneNumber, nominationChild.ref());
					    //    alert("Yay!");
					    //}
					});
					var lblNominee = $('<label>' + nominationChildName + '</label>');
					li.append(chkbx).append(lblNominee);
					ul.append(li);
					//btnNominee.addEventListener('click', function(e) {
					//	e.preventDefault();
					//	commitVote(currentElectionRef, phoneNumber, nominationChild.ref());
					//});
					//$('div#divNomineeListing div#nominees').append(btnNominee);
					//$('div#divNomineeListing div#nominees > button').addClass('formee-button');
				});
			}
	    });
	    $('div#divNomineeListing div#nominees').empty();
	    $('div#divNomineeListing div#nominees').append(ul);
        // Create submit votes button
	    var btnSubmitVotes = $('<button>SUBMIT VOTES</button>');
	    btnSubmitVotes.attr({ 'class': 'formee-button' });
	    btnSubmitVotes.click(function () {
	        if (parseInt(numChecked) === parseInt(numberToElect)) {
	            commitVotes(currentElectionRef, removeElectionForVoter(currentElectionRef, phoneNumber));
	
	            //removeElectionForVoter(electionRef, phoneNumber);
	        }
	        return false;
	    });
	    $('div#divNomineeListing div#nominees').append(btnSubmitVotes);
	});
	hideElectionsShowNominees();
}

//function clearNomineeCheckboxes() {
//    $('div#divNomineeListing div#nominees ul li input:checked').attr({ checked: 'false' });
//}

//function getNumbertoElect(curElectionSnapshot) {
//    curElectionSnapshot.forEach(function (child) {
//        if ($.trim(child.name()) === "NumberToElect") {
//            var numToElect = child.val();
//            numbertoElect = numToElect;
//        }
//    });
//}

function verifyCurrentElectionOpen(elections, curElectionName, phoneNumber)
{
	var currentElectionsRef = elections.child(curElectionName);
	var votersRef = currentElectionsRef.child('Voters');
	votersRef.once('value', function (votersSnapshot) {
	    var numToElect;
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
				hideNomineeErrorMessages();
				currentElectionsRef.once('value', function (electionSnapshot) {
				    electionSnapshot.forEach(function (child) {
				        if ($.trim(child.name()) === "NumberToElect") {
				            numToElect = parseInt(child.val());
				            selectElection(currentElectionsRef.name(), phoneNumber, elections, numToElect);
				        }
				    });
				});
			}
		});
	});
}

function displayNomineeSelectedMessage(numberSelected, numberToSelect) {
    if (parseInt(numberSelected) < parseInt(numberToSelect)) {
        emptyOldNomineeInfoMessages();
        emptyOldNomineeSuccessMessages();
        $('div#divNomineeListing div.formee-msg-info').append("<h3>You still have " +
                (parseInt(numberToSelect) - parseInt(numberSelected)) + " vote(s) to cast!</h3>");
        hideNomineeErrorMessages();
        hideNomineeSuccessMessages();
        showNomineeInfoMessages();
    } else if (parseInt(numberSelected) > parseInt(numberToSelect)) {
        emptyOldNomineeInfoMessages();
        emptyOldNomineeSuccessMessages();
        emptyOldNomineeErrorMessages();
        $('div#divNomineeListing div.formee-msg-error').append("<h3>You may only select " +
                parseInt(numberToSelect) + " nominees for this election!</h3>");
        hideNomineeInfoMessages();
        hideNomineeSuccessMessages();
        showNomineeErrorMessages();
    } else {
        // commit vote
        emptyOldNomineeInfoMessages();
        emptyOldNomineeSuccessMessages();
        emptyOldNomineeErrorMessages();
        $('div#divNomineeListing div.formee-msg-success').append("<h3>Your are ready to submit your votes!</h3>");
        hideNomineeInfoMessages();
        hideNomineeErrorMessages();
        showNomineeSuccessMessages();
        //commitVotes(electionRef, phoneNumber);
    }
}

function commitVotes(electionRef) {
    var nominationsRef = electionRef.child('Nominations');
    $('div#divNomineeListing div#nominees ul').first().children('li').children('input[type=checkbox]:checked').each(function () {
        //alert("about to commit vote for " + $(this).next('label').text());
        var voteName = $(this).next('label').text();
        nominationsRef.once('value', function (nominationsSnapshot) {
            nominationsSnapshot.forEach(function (nomination) {
                var nomineeName = nomination.val().Name;
                if ($.trim(nomineeName) === $.trim(voteName)) {
                    var numVotes = parseInt(nomination.val().NumberOfVotes);
                    numVotes++;
                    nomination.ref().update({ NumberOfVotes: numVotes });
                    //commitVote(electionRef, phoneNumber, nomination.ref());
                }
            });
        });
    });
    //removeElectionForVoter(electionRef, phoneNumber);
}

//function commitVote(currentElectionRef, phoneNumber, nominationRef)
//{
//    nominationRef.once('value', function (nominationSnapshot) {
//        var numVotes = nominationSnapshot.val().NumberOfVotes;
//        var nomineeName = nominationSnapshot.val().Name;
//        //var snapshotName = nominationSnapshot.name();
//        //var nomination = currentElectionRef.child('Nominations').child(snapshotName);
//        currentElectionRef.once('value', function(curElectionSnapshot) {
//            var numberToElect = curElectionSnapshot.val().NumberToElect;
//            //var numVoters = curElectionSnapshot.val().NumVoters;
//            //if (numberToElect <= numVotedFor)
//            //{
//            //    alert("Sorry, you have already voted for " + numberToElect + " candidates in this election.");
//            //    numVotedFor = 0;	
//            //    removeElectionForVoter(currentElectionRef, curElectionSnapshot, phoneNumber, numVoters);
//            //    clearElectionAndNomineeDivContents();
//            //    hideNomineesShowPolls();
//            //    return;
//            //}

//            numVotes++;
//            nomination.update({NumberOfVotes: numVotes});
//            //numVotedFor++;
//            //alert("Vote for " + nomineeName + " submitted!");
//            emptyOldNomineeSuccessMessages();
//            $('div#divNomineeListing div.formee-msg-success').append("<h3>Your Vote for " + nomineeName 
//                                + " has Been Submitted!</h3>");
//            showNomineeSuccessMessages();
//            //if (numberToElect <= numVotedFor) {
//            //    //alert("Thank you for voting!");
//            //    // Reset the number to 0
//            //    numVotedFor = 0;
//            //    removeElectionForVoter(currentElectionRef, curElectionSnapshot, phoneNumber, numVoters);
//            //    clearElectionAndNomineeDivContents();
//            //    hideNomineesShowPolls();
//            //    return;
//            //}
//            //else 
//            //{
//            //    //alert("You still have " + (parseInt(numberToElect) - parseInt(numVotedFor)) + " vote(s) to cast");
//            //    emptyOldNomineeInfoMessages();
//            //    $('div#divNomineeListing div.formee-msg-info').append("<h3>You still have " +
//            //            (parseInt(numberToElect) - parseInt(numVotedFor)) + " vote(s) to cast!");
//            //    showNomineeInfoMessages();
//            //    return;
//            //}
//        });
//    });
//}

function removeElectionForVoter(currentElectionRef, phoneNumber)
{
    var votersRef = currentElectionRef.child('Voters');
    currentElectionRef.once('value', function (electionSnapshot) {
        var numVoters = electionSnapshot.child('NumVoters').val();
        votersRef.once('value', function (votersSnapshot) {
            votersSnapshot.forEach(function (voter) {
                var voterPhoneNumber = voter.val().Number;
                if ($.trim(voterPhoneNumber) === $.trim(phoneNumber)) {
                    //alert("Removed voter " + voter.val().Name + " from election " 
                    //+ currentElectionSnapshot.val().Name);
                    voterRef = votersRef.child(voter.name());
                    voterRef.remove();
                    numVoters--;
                    currentElectionRef.update({ NumVoters: numVoters });
                    hideElections();
                    hideNominees();
                    $('div#divPollListing').show();
                    $('div#divElectionListing div#elections').empty();
                    /*$('div#divNomineeListing div#nominees').append("<div class='formee-msg-success'>" +
                            "<h3>Thank You for Voting, " + voter.val().Name + "</h3></div>");*/
                }
            });

        });
    });
}

function viewPollResults() {
    window.location = "results.html";
    return false;
}
// We must keep numVotedFor until we call a function which takes us out of the 
// current election, at which time it will be set back to 0