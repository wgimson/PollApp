///////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES
///////////////////////////////////////////////////////////////////
// Holds the currently created poll
//var curPoll;
// Holds list of elections for current poll
//var curElections;
// Holds current electoin
//var curElection;
// Holds list of all nominatios for current election
var curNominations;

///////////////////////////////////////////////////////////////////
// DATA ACCESS FUNCTIONS
///////////////////////////////////////////////////////////////////
function createTable()
{
	var tbl = document.createElement('table');

	// Create header, footer and body
	var thead = document.createElement('thead');
	var tbody = document.createElement('tbody');
	var tfoot = document.createElement('tfoot');
	tbl.appendChild(thead);
	tbl.appendChild(tbody);
	tbl.appendChild(tfoot);
	// Create header row
	$(tbl).attr({
		id: 'edit-gradient-style'
	});
	return tbl;
}

function displayCurrentPollsForEditing(pollsRef)
{
	var tbl = createTable();
	var th = ('<th>Polls</th>');
	$(th).attr('colspan', '3');
	$(th).appendTo($(tbl).children('thead'));
	pollsRef.once('value', function(pollsSnapshot) {
		pollsSnapshot.forEach(function(pollsChild) {
			var type = pollsChild.name();
			// If this is true if means we have a poll node
			if ($.trim(type) !== "NumPolls") 
			{
				// Create variables
				var pollRef = pollsRef.child(type);
				var pollName = pollsChild.val().Name;
				var btnEditPoll = $('<button>EDIT</button>');
				var btnRemovePoll = $('<button>REMOVE</button>');
				var tr = $('<tr></tr>');
				var voterColumn = $('<td></td>');
				var editColumn = $('<td></td>');
				var rmvColumn = $('<td></td>');
				// Append text and set attributes and listeners
				voterColumn.text(pollName);
				voterColumn.attr('width', '300px');
				btnEditPoll.attr({
					'class': 'formee-table-button',
					'font-size': '1.0em',
				});
				btnRemovePoll.attr({
					'class': 'formee-table-remove-button',
					'font-size': '1.0em',
				});
				btnEditPoll.appendTo($(editColumn));
				btnRemovePoll.appendTo($(rmvColumn));
				// Append to row and row to table body
				tr.append(voterColumn).append(editColumn).append(rmvColumn);
				tr.appendTo($(tbl).children('tbody'));
				// Append table to div to be displayed
				$('div#divEditPoll fieldset#selectPoll div#appendPolls').empty();
				$(tbl).appendTo('div#divEditPoll fieldset#selectPoll div#appendPolls');
			}
		});
		assignPollButtonIds();
		bindAllPollButtons(pollsRef);
	});
}

function assignPollButtonIds() {
    var btnsEdit = $('div#appendPolls button.formee-table-button');
    btnsEdit.each(function(index) {
        $(this).attr({ id: 'btnEditPoll' + index });
    });

    var btnsRemove = $('div#appendPolls button.formee-table-remove-button');
    btnsRemove.each(function (index) {
        $(this).attr({ id: 'btnRemovePoll' + index });
    });
}

function bindAllPollButtons(pollsRef)
{
	var btnsEdit = $('div#appendPolls button[id^="btnEditPoll"]');

	$(btnsEdit).each(function() {
		$(this).click(function() {
			displayPollEditOptions($(this), pollsRef);
			return false;
		});
	});

	var btnsRemove = $('div#appendPolls button.formee-table-remove-button');

	$(btnsRemove).each(function() {
		$(this).click(function() {
			deletePoll($(this), pollsRef);
			return false;
		});
	});
}

function deletePoll(removeButton, pollsRef)
{
	var pollToDelete = $.trim($(removeButton).closest('tr').children('td').first().text());
	var rowToDelete = $(removeButton).closest('tr');
	pollsRef.once('value', function(pollsSnapshot) {
		var numPolls = pollsSnapshot.val().NumPolls;
		pollsSnapshot.forEach(function(poll) {
			if ($.trim(poll.name() !== "NumPolls")) 
			{
				var pollName = poll.val().Name;
				if ($.trim(pollName) === pollToDelete)
				{
					pollsRef.child(poll.name()).remove();
					$(rowToDelete).remove();
					numPolls = parseInt(numPolls) - 1;
					pollsRef.update({ NumPolls: numPolls });
					showPollRemovedSuccessMsg(pollName);
				}
			}
		});
	});
}

function displayPollEditOptions(btnEditPoll, pollsRef)
{
	$('div#divEditPoll fieldset#changePollName div.grid-12-12').empty();
	hideSelectPollFieldsetAndShowEditPollFieldsets();
	var pollName = $.trim(btnEditPoll.closest('tr').children('td').eq(0).text());
	pollsRef.once('value', function (pollsSnapshot) {
	    pollsSnapshot.forEach(function (poll) {
	        if ($.trim(poll.val().Name) === pollName) {
	            var pollRef = pollsRef.child(poll.name());
	            pollRef.once('value', function(pollSnapshot) {
		        var pollName = pollSnapshot.val().Name;
		        // Create text box to edit poll name in 
		        var txtEditPollName = $('<input />');
		        $(txtEditPollName).attr({
			        id: 'txtEditPollName', 
			        type: 'text',
			        value: pollName,
			        'class': 'formee-small'
		        });
		        $(txtEditPollName).appendTo($('div#divEditPoll fieldset#changePollName div.grid-12-12'));
		        // Create submit button
		        var btnEditPollSubmit = $('<button>SUBMIT POLL NAME CHANGE</button>');
		        $(btnEditPollSubmit).attr('class', 'formee-button');
		        $(btnEditPollSubmit).click(function() {
			        changePollName(pollRef, txtEditPollName.val());	
			        return false;
		        });
		        $(btnEditPollSubmit).appendTo($('div#divEditPoll fieldset#changePollName div.grid-12-12'));
		        // Add election buttons
		        displayElectionsTable(pollRef);
	        });
	        }
	    });
	});
	
}

function changePollName(pollRef, newPollName)
{
    if ($.trim(newPollName) !== '') {
        pollRef.update({ Name: newPollName });
        $('div#divEditPoll fieldset#changePollName div.formee-msg-success').empty();
        $('div#divEditPoll fieldset#changePollName div.formee-msg-error').empty();
        $('div#divEditPoll fieldset#changePollName div.formee-msg-success').append('<h3>Poll Name Changed!</h3>');
        $('div#divEditPoll fieldset#changePollName div.formee-msg-error').hide();
        $('div#divEditPoll fieldset#changePollName div.formee-msg-success').show();
    } else {
        $('div#divEditPoll fieldset#changePollName div.formee-msg-success').empty();
        $('div#divEditPoll fieldset#changePollName div.formee-msg-error').empty();
        $('div#divEditPoll fieldset#changePollName div.formee-msg-error').append('<h3>Please Enter a Valid Poll Name!</h3>');
        $('div#divEditPoll fieldset#changePollName div.formee-msg-success').hide();
        $('div#divEditPoll fieldset#changePollName div.formee-msg-error').show();
    }
}

function displayElectionsTable(pollRef)
{
	var electionsRef = pollRef.child('Elections');
	var tbl = createTable();
	var th = ('<th>Elections</th>');
	$(th).attr('colspan', '3');
	$(th).appendTo($(tbl).children('thead'));
	electionsRef.once('value', function(electionsSnapshot) {
		electionsSnapshot.forEach(function(electionsChild) {
			var electionName = electionsChild.val().Name;
			var electionRef = electionsRef.child(electionsChild.name());
			var btnEditElection = $('<button>EDIT</button>');
			var btnRemoveElection = $('<button>REMOVE</button>');
			var tr = $('<tr></tr>');
			var electionColumn = $('<td></td>');
			electionColumn.css('width', '300px');
			var editColumn = $('<td></td>');
			var rmvColumn = $('<td></td>');
			// Append text and set attributes and listeners
			$(electionColumn).text(electionName);
			$(electionColumn).attr('width', '300px');
			$(btnEditElection).attr({
				'class': 'formee-table-button',
				'font-size': '1.0em'
			});
			$(btnRemoveElection).attr({
				'class': 'formee-table-remove-button',
				'font-size': '1.0em'
			});
			$(btnEditElection).appendTo($(editColumn));
			$(btnRemoveElection).appendTo($(rmvColumn));
			$(btnEditElection).click(function() {
				displayElectionEditOptions(electionRef);
				return false;
			});
			$(btnRemoveElection).click(function() {
				deleteElection($(this), electionsRef);
				return false;
			});
			// Append to row and row to table body
			$(tr).append(electionColumn).append(editColumn).append(rmvColumn);
			$(tr).appendTo($(tbl).children('tbody'));
		});
		// Append table to div to be displayed
		$('div#divEditPoll fieldset#selectElection div#appendElections').empty();
		$(tbl).appendTo('div#divEditPoll fieldset#selectElection div#appendElections');
	    //displayElectionAttributesToEdit(electionRef);
	    // Create and append add election row
		createAddElectionRow(pollRef, tbl);
	});
}

function createAddElectionRow(pollRef, table) {
    var btnNewElection = $('<button>ADD</button>');
    var electionName = $('<input></input>');
    var electionNum = $('<input></input>');
    electionName.attr({
        type: "text",
        value: "Election Name"
    });
    electionName.css({
        'height': '36px',
        'width': '250px',
        'font-size': '14px'
    });
    electionName.click(function() {
    	$(this).val('');
    });
    electionNum.attr({
        type: "text",
        value: "Number to Elect"
    });
    electionNum.css({
        'height': '36px',
        'width': '150px',
        'font-size': '14px'
    });
    electionNum.click(function() {
    	$(this).val('');
    });
    var tr = $('<tr></tr>');
    var electionNameCol = $('<td></td>');
    var btnCol = $('<td></td>');
    var electionNumCol = $('<td></td>');
    btnNewElection.attr({
        'class': 'formee-table-button',
        'font-size': '1.0em'
    });
    btnNewElection.click(function () {
        addElectionWithParams(pollRef, electionName.val(), electionNum.val());
        displayElectionsTable(pollRef);
        return false;
    });
    electionName.appendTo(electionNameCol);
    electionNum.appendTo(electionNumCol);
    btnNewElection.appendTo(btnCol);
    tr.append(electionNameCol).append(electionNumCol).append(btnCol);
    tr.appendTo($(table).children('tbody'));
}

function displayElectionEditOptions(electionRef)
{
	populateElectionDetailFields(electionRef);
	displayNomineesTable(electionRef);
	displayVotersTable(electionRef);
}

function displayNomineesTable(electionRef)
{
	var tbl = createTable();
	var th = ('<th>Nominees</th>');
	$(th).attr('colspan', '3');
	$(th).appendTo($(tbl).children('thead'));
	var nominationsRef = electionRef.child('Nominations');
	nominationsRef.once('value', function(nominationsSnapshot) {
		nominationsSnapshot.forEach(function(nominee) {
			// Create variables
			var nomineeRef = nominationsRef.child(nominee.name());
			var nomineeName = nominee.val().Name;
			var btnEditNominee = $('<button>EDIT</button>');
			var btnRemoveNominee = $('<button>REMOVE</button>');
			var tr = $('<tr></tr>');
			var nomineeColumn = $('<td></td>');
			var editColumn = $('<td></td>');
			var rmvColumn = $('<td></td>');
			// Append text and set attributes and listeners
			$(nomineeColumn).text(nomineeName);
			$(nomineeColumn).attr('width', '300px');
			$(btnEditNominee).attr({
				'class': 'formee-table-button',
				'font-size': '1.0em'
			});
			$(btnRemoveNominee).attr({
				'class': 'formee-table-remove-button',
				'font-size': '1.0em'
			});
			$(btnEditNominee).appendTo($(editColumn));
			$(btnRemoveNominee).appendTo($(rmvColumn));
			$(btnEditNominee).click(function() {
				displayNomineeEditOptions($(this), nomineeRef);
				return false;
			});
			$(btnRemoveNominee).click(function() {
				deleteNominee($(this), nomineeRef);
				return false;
			});
			// Append to row and row to table body
			$(tr).append(nomineeColumn).append(editColumn).append(rmvColumn);
			$(tr).appendTo($(tbl).children('tbody'));
		});
		// Append table to div to be displayed
		$('div#divEditElectionDetails fieldset#addNominations div#nominationsTable').empty();
		$('div#divEditElectionDetails fieldset#addNominations div#nominationsTable').show();
		$(tbl).appendTo('div#divEditElectionDetails fieldset#addNominations div#nominationsTable');
		createAddNominationRow(electionRef, tbl);
		hidePollDetailsShowElectionDetails();
	});
}

function createAddNominationRow(electionRef, table) {
    var btnNewNominee = $('<button>ADD</button>');
    var nomineeName = $('<input></input>');
    nomineeName.attr({
        type: "text",
        value: "Nominee Name"
    });
    nomineeName.css({
        'height': '36px',
        'width': '250px',
        'font-size': '14px'
    });
    nomineeName.click(function () {
        $(this).val('');
    });
    var tr = $('<tr></tr>');
    var nomineeNameCol = $('<td></td>');
    var btnCol = $('<td></td>');
    btnNewNominee.attr({
        'class': 'formee-table-button',
        'font-size': '1.0em'
    });
    btnNewNominee.click(function () {
        submitNominationsWithParams(electionRef, $.trim(nomineeName.val()));
        return false;
    });
    nomineeName.appendTo(nomineeNameCol);
    btnNewNominee.appendTo(btnCol);
    tr.append(nomineeNameCol).append(btnCol);
    tr.appendTo($(table).children('tbody'));
}


function displayNomineeEditOptions(editButton, nomineeRef)
{
	var rowToEdit = $(editButton).closest('tr');
	nomineeRef.once('value', function(nomineeSnapshot) {
		var nomineeToEditName = nomineeSnapshot.val().Name;
		$(rowToEdit).children('td').each(function() {
			$(this).empty();
		});
		var txtEditNominee = $('<input></input>');
		$(txtEditNominee).attr({
			type: 'text',
			value: nomineeToEditName
		});
		txtEditNominee.css({
		    'height': '36px',
		    'width': '250px',
		    'font-size': '14px'
		});
		var btnSubmitEdit = $('<button>SUBMIT</button>');
		$(btnSubmitEdit).attr({
			'class': 'formee-table-button',
			'font-size': '1.0em'	
		});
		$(btnSubmitEdit).click(function() {
			submitNomineeEdit($(this), nomineeRef);
			return false;
		});
		var btnCancelEdit = $('<button>CANCEL</button>');
		$(btnCancelEdit).attr({
			'class': 'formee-table-remove-button',
			'font-size': '1.0em'	
		});
		$(btnCancelEdit).click(function() {
			removeNomineeEditOptions($(this), nomineeRef)
			return false;
		});
		$(rowToEdit).children('td').eq(0).append($(txtEditNominee));
		$(rowToEdit).children('td').eq(1).append($(btnSubmitEdit));
		$(rowToEdit).children('td').eq(2).append($(btnCancelEdit));
	});
}

function submitNomineeEdit(submitEditButton, nomineeRef) 
{
	var newNomineeName = $.trim($(submitEditButton).closest('tr').children('td').eq(0).children('input').val());
	if (newNomineeName === "")
	{
		displayEmptyNomineeNameError();
	} else  {
		nomineeRef.update({ Name: newNomineeName });
		displayNomineeNameChangedSuccessMsg();
		removeNomineeEditOptions(submitEditButton, nomineeRef);
	}
}

function removeNomineeEditOptions(submitEditButton, nomineeRef)
{
	var rowToEdit = $(submitEditButton).closest('tr');
	nomineeRef.once('value', function(nomineeSnapshot) {
		var nomineeName = nomineeSnapshot.val().Name;
		$(rowToEdit).children('td').each(function() {
			$(this).empty();
		});
		// Create variables
		var btnEditNominee = $('<button>EDIT</button>');
		var btnRemoveNominee = $('<button>REMOVE</button>');
		// Append text and set attributes and listeners
		$(btnEditNominee).attr({
			'class': 'formee-table-button',
			'font-size': '1.0em'
		});
		$(btnRemoveNominee).attr({
			'class': 'formee-table-remove-button',
			'font-size': '1.0em'
		});
		$(btnEditNominee).click(function() {
			displayNomineeEditOptions($(this), nomineeRef);
			return false;
		});
		$(btnRemoveNominee).click(function() {
			deleteNominee($(this), nomineeRef);
			return false;
		});
		$(rowToEdit).children('td').eq(0).text(nomineeName);
		$(rowToEdit).children('td').eq(1).append($(btnEditNominee));
		$(rowToEdit).children('td').eq(2).append($(btnRemoveNominee));
	});
}

function deleteNominee(rmvButton, nomineeRef)
{
	var electionRef = nomineeRef.parent().parent();
	electionRef.once('value', function(electionSnapshot) {
		var numNominations = electionSnapshot.val().NumNominations;
		nomineeRef.once('value', function(nomineeSnapshot) {
			var nomineeName = nomineeSnapshot.val().Name;
			var rowToRemove = $(rmvButton).closest('tr');
			nomineeRef.remove();
			numNominations = parseInt(numNominations) - 1;
			electionRef.update({ NumNominations: numNominations });
			$(rowToRemove).remove();
			displayNomineeRemovedSuccessMsg(nomineeName);
		});
	});
}

function displayVotersTable(electionRef)
{
	var tbl = createTable();
	var th = ('<th>Voters</th>');
	$(th).attr('colspan', '3');
	$(th).appendTo($(tbl).children('thead'));
	var votersRef = electionRef.child('Voters');
	votersRef.once('value', function(votersSnapshot) {
		votersSnapshot.forEach(function(voter) {
			// Create variables
			var voterRef = votersRef.child(voter.name());
			var voterName = voter.val().Name;
			var voterNumber = voter.val().Number;
			voterNumber = '(' + voterNumber.substr(0, 3) + ') ' + voterNumber.substr(3, 3) + '-' + voterNumber.substr(6);
			var btnEditVoter = $('<button>EDIT</button>');
			var btnRemoveVoter = $('<button>REMOVE</button>');
			var tr = $('<tr></tr>');
			var voterNameColumn = $('<td></td>');
			var voterNumberColumn = $('<td></td>');
			var editColumn = $('<td></td>');
			var rmvColumn = $('<td></td>');
			// Append text and set attributes and listeners
			$(voterNameColumn).text(voterName);
			$(voterNameColumn).attr('width', '300px');
			$(voterNumberColumn).text(voterNumber);
			$(voterNumberColumn).attr('width', '300px');
			$(btnEditVoter).attr({
				'class': 'formee-table-button',
				'font-size': '1.0em'
			});
			$(btnRemoveVoter).attr({
				'class': 'formee-table-remove-button',
				'font-size': '1.0em'
			});
			$(btnEditVoter).appendTo($(editColumn));
			$(btnRemoveVoter).appendTo($(rmvColumn));
			$(btnEditVoter).click(function() {
				displayVoterEditOptions($(this), voterRef);
				return false;
			});
			$(btnRemoveVoter).click(function() {
				deleteVoter($(this), voterRef);
				return false;
			});
			// Append to row and row to table body
			$(tr).append(voterNameColumn).append(voterNumberColumn).append(editColumn).append(rmvColumn);
			$(tr).appendTo($(tbl).children('tbody'));
		});
		// Append table to div to be displayed
		$('div#divEditElectionDetails fieldset#addVoters div#votersTable').empty();
		$('div#divEditElectionDetails fieldset#addVoters div#votersTable').show();
		$(tbl).appendTo('div#divEditElectionDetails fieldset#addVoters div#votersTable');
		createAddVoterRow(electionRef, tbl);
		//hidePollDetailsShowElectionDetails();
	});
}

function createAddVoterRow(electionRef, table) {
    var btnNewVoter = $('<button>ADD</button>');
    var voterName = $('<input></input>');
    var voterNumber = $('<input></input>');
    voterName.attr({
        type: "text",
        value: "Voter Name",
        colspan: '2'
    });
    voterName.css({
        'height': '36px',
        'width': '250px',
        'font-size': '14px'
    });
    voterName.click(function () {
        $(this).val('');
    });
    voterNumber.attr({
        type: 'text',
        value: 'Voter Phone Number',
    });
    voterNumber.css({
        'height': '36px',
        'width': '250px',
        'font-size': '14px'
    });
    voterNumber.click(function () {
        $(this).val('');
    });
    var tr = $('<tr></tr>');
    var voterNameCol = $('<td></td>');
    var voterNumCol = $('<td></td>');
    //var spaceCol = $('<td></td>');
    var btnCol = $('<td></td>');
    btnNewVoter.attr({
        'class': 'formee-table-button',
        'font-size': '1.0em'
    });
    btnNewVoter.click(function () {
        submitVotersWithParams(electionRef, $.trim(voterName.val()), $.trim(voterNumber.val()));
        return false;
    });
    voterName.appendTo(voterNameCol);
    voterNumber.appendTo(voterNumCol);
    btnNewVoter.appendTo(btnCol);
    tr.append(voterNameCol).append(voterNumCol).append(btnCol);
    tr.appendTo($(table).children('tbody'));
}

function displayVoterEditOptions(editButton, voterRef)
{
	var rowToEdit = $(editButton).closest('tr');
	voterRef.once('value', function(voterSnapshot) {
		var voterToEditName = voterSnapshot.val().Name;
		var voterToEditNumber = voterSnapshot.val().Number;
		$(rowToEdit).children('td').each(function() {
			$(this).empty();
		});
		var txtEditVoterName = $('<input></input>');
		$(txtEditVoterName).attr({
			type: 'text',
			value: voterToEditName
		});
		txtEditVoterName.css({
		    'height': '36px',
		    'width': '250px',
		    'font-size': '14px'
		});
		var txtEditVoterNumber = $('<input></input>');
		$(txtEditVoterNumber).attr({
			type: 'text', 
			value: voterToEditNumber
		})
		txtEditVoterNumber.css({
		    'height': '36px',
		    'width': '250px',
		    'font-size': '14px'
		});
		var btnSubmitEdit = $('<button>SUBMIT</button>');
		$(btnSubmitEdit).attr({
			'class': 'formee-table-button',
			'font-size': '1.0em'	
		});
		$(btnSubmitEdit).click(function() {
			submitVoterEdit($(this), voterRef);
			return false;
		});
		var btnCancelEdit = $('<button>CANCEL</button>');
		$(btnCancelEdit).attr({
			'class': 'formee-table-remove-button',
			'font-size': '1.0em'	
		});
		$(btnCancelEdit).click(function() {
			removeVoterEditOptions($(this), voterRef);
			return false;
		});
		$(rowToEdit).children('td').eq(0).append($(txtEditVoterName));
		$(rowToEdit).children('td').eq(1).append($(txtEditVoterNumber));
		$(rowToEdit).children('td').eq(2).append($(btnSubmitEdit));
		$(rowToEdit).children('td').eq(3).append($(btnCancelEdit));
	});
}

function submitVoterEdit(submitEditButton, voterRef)
{
	var newVoterName = $.trim($(submitEditButton).closest('tr').children('td').eq(0).children('input').val());
	var newVoterNumber = $.trim($(submitEditButton).closest('tr').children('td').eq(1).children('input').val());
	if (newVoterName === "")
	{
		displayEmptyVoterNameErrorMsg();
	} 
	else if (!checkIsValidPhoneNumber(newVoterNumber)) 
	{
		displayVoterNumberErrorMsg();
	}
	else
	{
		voterRef.update({ Name: newVoterName, Number: newVoterNumber });
		displayVoterNameAndNumberChangedSuccessMsg();
		removeVoterEditOptions(submitEditButton, voterRef);
	}
}

function removeVoterEditOptions(submitEditButton, voterRef)
{
	var rowToEdit = $(submitEditButton).closest('tr');
	voterRef.once('value', function(voterSnapshot) {
		var voterName = voterSnapshot.val().Name;
		var voterNumber = voterSnapshot.val().Number;
		voterNumber = '(' + voterNumber.substr(0, 3) + ') ' + voterNumber.substr(3, 3) + '-' + voterNumber.substr(6);
		$(rowToEdit).children('td').each(function() {
			$(this).empty();
		});
		// Create variables
		var btnEditVoter = $('<button>EDIT</button>');
		var btnRemoveVoter = $('<button>REMOVE</button>');
		// Append text and set attributes and listeners
		$(btnEditVoter).attr({
			'class': 'formee-table-button',
			'font-size': '1.0em'
		});
		$(btnRemoveVoter).attr({
			'class': 'formee-table-remove-button',
			'font-size': '1.0em'
		});
		$(btnEditVoter).click(function() {
			displayVoterEditOptions($(this), voterRef);
			return false;
		});
		$(btnRemoveVoter).click(function() {
			deleteNominee($(this), voterRef);
			return false;
		});
		$(rowToEdit).children('td').eq(0).text(voterName);
		$(rowToEdit).children('td').eq(1).text(voterNumber);
		$(rowToEdit).children('td').eq(2).append($(btnEditVoter));
		$(rowToEdit).children('td').eq(3).append($(btnRemoveVoter));
	});
}

function deleteVoter(rmvButton, voterRef)
{
	var electionRef = voterRef.parent().parent();
	electionRef.once('value', function(electionSnapshot) {
		var numVoters = electionSnapshot.val().NumVoters;
		voterRef.once('value', function(voterSnapshot) {
			var voterName = voterSnapshot.val().Name;
			var rowToRemove = $(rmvButton).closest('tr');
			voterRef.remove();
			numVoters = parseInt(numVoters) - 1;
			electionRef.update({ NumVoters: numVoters });
			$(rowToRemove).remove();
			displayVoterRemovedSuccessMsg(voterName);
		});
	});
}

function deleteElection(removeButton, electionsRef)
{
	var electionToDelete = $.trim($(removeButton).closest('tr').children('td').first().text());
	var rowToDelete = $(removeButton).closest('tr');
	var pollRef = electionsRef.parent();
	pollRef.once('value', function(pollSnapshot) {
		var numElections = pollSnapshot.val().NumElections;
		electionsRef.once('value', function(electionsSnapshot) {
			electionsSnapshot.forEach(function(election) {
				var electionName = election.val().Name;
				if ($.trim(electionName) === electionToDelete)
				{
					electionsRef.child(election.name()).remove();
					$(rowToDelete).remove();
					numElections = parseInt(numElections) - 1;
					pollRef.update({ NumElections: numElections });
					showElectionRemovedSuccessMsg(electionName);
				}
			});
		});
	});
}

/*function displayElectionAttributesToEdit(electionRef) 
{
	showElectionDetails(electionRef);
}*/

function populateElectionDetailFields(electionRef)
{
	electionRef.once('value', function(electionSnapshot) {
		var electionName = electionSnapshot.val().Name;
		// Create text field to edit election name
		var txtEditElectionName = createAndAppendEditElectionNameTextField(electionName);

		// Create text field to edit number to elect 
		var numberToElect = electionSnapshot.val().NumberToElect;
		var txtEditNumberToElect = createAndAppendEditNumberToElect(numberToElect);

		// Create and append submit button
		createAndAppendSubmitButton(electionRef, txtEditElectionName, txtEditNumberToElect);

		// Create form for adding nominees
		//createAddNomineeFields(electionRef);

		// Create form for adding voters
		//createAddVoterFields(electionRef);

		// Create select elements for editing existing nominees and voters
		//createVoterAndNomineeLists(electionRef);

		//$('div#divEditElectionDetails fieldset#editExisting').css('height', '100%');
	});
}

/*function createAddNomineeFields(electionRef)
{
	// Create label
	var lblNomineeName = $('<label>Nominee Name</label>');
	// Create text field to add nominees
	var txtAddNominee = $('<input />');
	$(txtAddNominee).attr({
		type: 'text',
		'class': 'txtAddNominee formee-medium'
	});
	$(lblNomineeName).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid1');
	$(txtAddNominee).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid1');
	var btnRemoveNominee = $('<button>REMOVE</button>');
	$(btnRemoveNominee).attr({
		'class': 'formee-remove-button',
		id: 'btnRemoveNominee'
	});
	$(btnRemoveNominee).click(function() {
		return false;
	});
	$(btnRemoveNominee).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid1');
	// Create button to add another nominee field
	var btnAddNominee = $('<button>ADD NOMINEE</button>');
	$(btnAddNominee).attr({
		'class': 'formee-button',
		id: 'btnAddNominee'
	});
	$(btnAddNominee).click(function() {
		addNominee();
		return false;
	});
	$(btnAddNominee).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid3');
	// Create a button to submit new nominees
	var btnSubmitNominees = $('<button>SUBMIT NOMINEE(S)</button>');
	$(btnSubmitNominees).attr('class', 'formee-button');
	$(btnSubmitNominees).click(function() {
		submitNominees(electionRef);
		return false;
	});
	$(btnSubmitNominees).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid3');
}

function addNominee()
{
	// First check that the user has filled out all existing nominee text boxes
	var hasFilledOutExistingNomineeInputs = checkExistingNomineeInputsFilled();
	if (!hasFilledOutExistingNomineeInputs)
	{
		$('div#divEditElectionDetails div.formee-msg-success').eq(1).hide();
		$('div#divEditElectionDetails div.formee-msg-error:first').empty();
		$('div#divEditElectionDetails div.formee-msg-error:first')
			.append('<h3>You must first fill out the existing nominee field(s)!');
		$('div#divEditElectionDetails div.formee-msg-error:first').show();
		return;
	} else {
		$('div#divEditElectionDetails div.formee-msg-error:first').hide();
		// Create label
		var lblNomineeName = $('<label>Nominee Name</label>');
		// Create text field to add nominees
		var txtAddNominee = $('<input />');
		$(txtAddNominee).attr({
			type: 'text',
			'class': 'txtAddNominee formee-medium'
		});
		var btnRemoveNominee = $('<button>REMOVE</button>');
		$(btnRemoveNominee).attr({
			'class': 'formee-remove-button',
			id: 'btnRemoveNominee'
		});
		$(btnRemoveNominee).click(function() {
			removeNominee($(this));
			return false;
		});
		$(lblNomineeName).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid1');
		$(txtAddNominee).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid1');
		$(btnRemoveNominee).appendTo('div#divEditElectionDetails fieldset#addNominations div#nomGrid1');
	}
}*/

/*function removeNominee(removeButton)
{
	$(removeButton).prev('input').remove();
	$(removeButton).prev('label').remove();
	$(removeButton).remove();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').empty();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').append('<h3>Nominee Removed!</h3>');
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').show();
}

function checkExistingNomineeInputsFilled()
{
	var lastNomineeName = 
		$('div#divEditElectionDetails fieldset#addNominations div#nomGrid1 input.txtAddNominee').last().val();
	if ($.trim(lastNomineeName) === "")
	{
		return false;
	} else {
		return true;
	}
}*/

function submitNominations(electionRef)
{
	// First check that the user has filled out all existing nominee text boxes
	if (existingNomineeFieldsValid())
	{
		var nomineesRef = electionRef.child('Nominations');
		electionRef.once('value', function(electionSnapshot) {
			var numNominees = electionSnapshot.val().NumNominations;
			$('fieldset#appendNominations div#appendNominations > input.txtAddNomination')
				.each(function() {
					newNomineeName = $.trim($(this).val());
					var newNomineeRef = nomineesRef.push();
					newNomineeRef.set({ Name: newNomineeName, NumberOfVotes: 0 });
					numNominees = parseInt(numNominees) + 1;
			});
			electionRef.update({ NumNominations: numNominees });
			var pollKey = generatePollKey();
			alert("Your Poll Key is: '" + pollKey + "'. Write this down and distribute to voters.");
			electionRef.parent().parent().update({ Key: pollKey });
			formatPollsDiv();
			//nominationsAddedShowOptions(electionRef);
			//displayNominationsAddedSuccessMessage();
		});
	}
}

function Dig4() {
    return Math.floor(Math.random() * 10000).toString();
}

function generatePollKey() {
    return Dig4();
}

function submitNominationsWithParams(electionRef, nomineeName) {
    if ($.trim(nomineeName) !== "") {
        var nomineesRef = electionRef.child('Nominations');
        electionRef.once('value', function (electionSnapshot) {
            var numNominees = electionSnapshot.val().NumNominations;
			newNomineeName = $.trim(nomineeName);
			var newNomineeRef = nomineesRef.push();
			newNomineeRef.set({ Name: newNomineeName, NumberOfVotes: 0 });
			numNominees = parseInt(numNominees) + 1;
			electionRef.update({ NumNominations: numNominees });
			displayElectionEditOptions(electionRef);
            //formatPollsDiv();
            //nominationsAddedShowOptions(electionRef);
            //displayNominationsAddedSuccessMessage();
        });
    }
}
/*function displayNominationsAddedSuccessMessage()
{
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-error').empty().hide();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').empty();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').append('<h3>Nominations Added!');
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').show();
	// Remove all but first text box and clear value
	$('div#divEditElectionDetails fieldset#addNominations div#nomGrid1 input:gt(0)').remove();
	$('div#divEditElectionDetails fieldset#addNominations div#nomGrid1 label:gt(0)').remove();
	$('div#divEditElectionDetails fieldset#addNominations div#nomGrid1 button#btnRemoveNominee:gt(0)').remove();
	$('div#divEditElectionDetails fieldset#addNominations div#nomGrid1 input').val('');
}

function createAddVoterFields(electionRef)
{
	// Create labels
	var lblVoterName = $('<label>Voter Name</label>');
	$(lblVoterName).attr('class', 'formee-equal');
	var lblVoterNumber = $('<label>Voter Phone Number xxx-xxx-xxxx</label>');
	$(lblVoterNumber).attr('class', 'formee-equal');
	// Create text field to add voter name
	var txtAddVoterName = $('<input />');
	var txtAddVoterNumber = $('<input />');
	$(txtAddVoterName).attr({
		type: 'text',
		'class': 'txtAddVoterName formee-large formee-equal'
	});
	$(txtAddVoterNumber).attr({
		type: 'text',
		'class': 'txtAddVoterNumber formee-medium formee-equal'
	});
	$(lblVoterName).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid1');
	$(txtAddVoterName).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid1');
	$(lblVoterNumber).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid2');
	$(txtAddVoterNumber).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid2');
	// Create remove voter button
	var btnRemoveVoter = $('<button>REMOVE</button>');
	$(btnRemoveVoter).attr('class', 'formee-remove-button');
	$(btnRemoveVoter).click(function(index) {
		removeVoter($(this));
		return false;
	});
	$(btnRemoveVoter).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid2');

	// Create a button to add new voters
	var btnAddVoter = $('<button>ADD VOTER</button>');
	$(btnAddVoter).attr('class', 'formee-button');
	$(btnAddVoter).click(function() {
		addVoterField();
		return false;
	});
	$(btnAddVoter).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid4');
	// Create a button to submit new voters
	var btnSubmitVoters = $('<button>SUBMIT VOTER(S)</button>');
	$(btnSubmitVoters).attr('class', 'formee-button');
	$(btnSubmitVoters).click(function() {
		submitVoterFields(electionRef);
		return false;
	});
	$(btnSubmitVoters).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid4');
}

function submitVoterFields(electionRef)
{
	// First check that the user has filled out all existing voter text boxes
	var hasFilledOutExistingVoterInputs = checkExistingVoterInputsFilled();
	if (!hasFilledOutExistingVoterInputs)
	{
		$('div#divEditElectionDetails div.formee-msg-success').eq(2).hide();
		$('div#divEditElectionDetails div.formee-msg-error').eq(1).empty();
		$('div#divEditElectionDetails div.formee-msg-error')
			.eq(1)
			.append('<h3>You must first fill out the existing nominee field(s)!');
		$('div#divEditElectionDetails div.formee-msg-error').eq(1).show();
		return;
	} else {
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
	}
	var lastVoterNumber = 
		$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 input.txtAddVoterNumber').last().val();
	var isValidPhoneNumber = checkIsValidPhoneNumber(lastVoterNumber);
	if (!isValidPhoneNumber) {
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').
			append('<h3>Enter a Valid Phone Number of Form xxx-xxx-xxxx</h3>');
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').show();
		return;
	} else {
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
	}
	var votersRef = electionRef.child('Voters');
	electionRef.once('value', function(electionSnapshot) {
		var numVoters = electionSnapshot.val().NumVoters;
		$('div#divEditElectionDetails fieldset#addVoters div#voterGrid1 input.txtAddVoterName')
			.each(function(index) {
				var voterName = $(this).val();
				var voterNumber = 
					$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 input.txtAddVoterNumber')
						.eq(index).val();
				var voterRef = votersRef.child('Voter' + (parseInt(numVoters)+1));
				voterRef.set({ Name: voterName, Number: voterNumber });
				numVoters = parseInt(numVoters) + 1;
		});
		electionRef.update({ NumVoters: numVoters });
		votersSuccessfullyAdded();
	});
}

function votersSuccessfullyAdded()
{
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid1 input.txtAddVoterName').slice(1).remove();
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid1 label').slice(1).remove();
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 input.txtAddVoterNumber').slice(1).remove();
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 label').slice(1).remove();
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 button').slice(1).remove();
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid1 input.txtAddVoterName').val('');
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 input.txtAddVoterNumber').val('');
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').append('<h3>Voters Added!</h3>');
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').show();
}

function addVoterField()
{
	// First check that the user has filled out all existing voter text boxes
	var hasFilledOutExistingVoterInputs = checkExistingVoterInputsFilled();
	if (!hasFilledOutExistingVoterInputs)
	{
		$('div#divEditElectionDetails div.formee-msg-success').eq(2).hide();
		$('div#divEditElectionDetails div.formee-msg-error').eq(1).empty();
		$('div#divEditElectionDetails div.formee-msg-error')
			.eq(1)
			.append('<h3>You must first fill out the existing nominee field(s)!');
		$('div#divEditElectionDetails div.formee-msg-error').eq(1).show();
		return;
	} else {
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
	}
	var lastVoterNumber = 
		$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 input.txtAddVoterNumber').last().val();
	var isValidPhoneNumber = checkIsValidPhoneNumber(lastVoterNumber);
	if (!isValidPhoneNumber) {
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').
			append('<h3>Enter a Valid Phone Number of Form xxx-xxx-xxxx</h3>');
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').show();
		return;
	} else {
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
	}
	// Create labels
	var lblVoterName = $('<label>Voter Name</label>');
	$(lblVoterName).attr('class', 'formee-equal');
	var lblVoterNumber = $('<label>Voter Phone Number xxx-xxx-xxxx</label>');
	$(lblVoterNumber).attr('class', 'formee-equal');
	// Create text field to add voter name
	var txtAddVoterName = $('<input />');
	var txtAddVoterNumber = $('<input />');
	$(txtAddVoterName).attr({
		type: 'text',
		'class': 'txtAddVoterName formee-large formee-equal'
	});
	$(txtAddVoterNumber).attr({
		type: 'text',
		'class': 'txtAddVoterNumber formee-medium formee-equal'
	});
	// Create remove voter button
	var btnRemoveVoter = $('<button>REMOVE</button>');
	$(btnRemoveVoter).attr('class', 'formee-remove-button');
	$(btnRemoveVoter).click(function(index) {
		removeVoter($(this));
		return false;
	});
	$(lblVoterName).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid1');
	$(txtAddVoterName).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid1');
	$(lblVoterNumber).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid2');
	$(txtAddVoterNumber).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid2');
	$(btnRemoveVoter).appendTo('div#divEditElectionDetails fieldset#addVoters div#voterGrid2');
}

function checkExistingVoterInputsFilled()
{
	var lastVoterName = 
	$('div#divEditElectionDetails fieldset#addVoters div#voterGrid1 input.txtAddVoterName').last().val();
	if ($.trim(lastVoterName) === "")
	{
		return false;
	} 
	var lastVoterNumber = 
		$('div#divEditElectionDetails fieldset#addVoters div#voterGrid2 input.txtAddVoterNumber').last().val();
	var isValidPhoneNumber = checkIsValidPhoneNumber(lastVoterNumber);
	if ($.trim(lastVoterNumber) === "") {
		return false;
	}
	return true;
}*/

function checkIsValidPhoneNumber(num)
{
	var isValid = /^(?!.*-.*-.*-)(?=(?:\d{8,10}$)|(?:(?=.{9,11}$)[^-]*-[^-]*$)|(?:(?=.{10,12}$)[^-]*-[^-]*-[^-]*$))[\d-]+$/g.test(num);
	return isValid;
}

/*function removeVoter(removeButton)
{
	var index = $('div#voterGrid2 > button').index($(removeButton));
	if (index > 0) {
		$(removeButton).prev('input').remove();
		$(removeButton).prev('label').remove();
		$('div#voterGrid1 > input').eq(index).remove();
		$('div#voterGrid1 > label').eq(index).remove();
		$(removeButton).remove();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').empty();
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').append('<h3>Voter Removed!</h3>');
		$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').show();
	}
}

function createVoterAndNomineeLists(electionRef)
{
	var nomineesRef = electionRef.child('Nominations');
	createNomineeList(nomineesRef);
	var votersRef = electionRef.child('Voters');
	createVotersList(votersRef);
}

function createNomineeList(nomineesRef)
{
	var nomineeList = $('<select></select>');
	nomineeList.attr('class', 'formee-medium');
	nomineesRef.once('value', function(nomineesSnapshot) {
		nomineesSnapshot.forEach(function(nominee) {
			var nomineeName = nominee.val().Name;
			nomineeList.append('<option>' + nomineeName + '</option>');
		});
		nomineeList.appendTo('div#divEditElectionDetails div#editExistingNominee');
		var btnSubmitNominee = $('<button>CHOOSE</button>');
		$(btnSubmitNominee).attr('class', 'formee-button');
		$(btnSubmitNominee).click(function() {
			displayNomineeDetail($(nomineeList), nomineesRef);
			return false;
		})
		$(btnSubmitNominee).appendTo('div#divEditElectionDetails div#editExistingNominee');
	});
}

function displayNomineeDetail(selectedNominee, nomineesRef) 
{
	var selectedNomineeName = $.trim($(selectedNominee).find(':selected').text());
	nomineesRef.once('value', function(nomineesSnapshot) {
		nomineesSnapshot.forEach(function(nominee) {
			if ($.trim(nominee.val().Name) === $.trim(selectedNomineeName))
			{
				var lblNomineeName = $('<label>Nominee Name</label>');
				var txtNomineeName = $('<input></input>');
				$(txtNomineeName).attr({
					type: 'text',
					'class': 'formee-small',
					id: 'txtNomineeName',
					value: selectedNomineeName
				});
				var btnEditNominee = $('<button>Submit Changes</button>');
				$(btnEditNominee).attr({
					'class': 'formee-button',
					id: 'btnEditNominee'
				});
				$(btnEditNominee).click(function() {
					submitNomineeNameChange($.trim($(txtNomineeName).val()), 
						selectedNomineeName, nomineesRef);
					return false;
				});
				$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails')
					.append(lblNomineeName);
				$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails')
					.append(txtNomineeName);
				$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails')
					.append(btnEditNominee);
				$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails')
					.show();
				$('div#divEditElectionDetails fieldset#editExisting div#editExistingVoter')
					.hide();
				$('div#divEditElectionDetails fieldset#editExisting div#editExistingNominee')
					.hide();
			}
		});
	});
}

function submitNomineeNameChange(newNomineeName, oldNomineeName, nomineesRef)
{
	nomineesRef.once('value', function(nomineesSnapshot) {
		nomineesSnapshot.forEach(function(nominee) {
			var nomineeName = $.trim(nominee.val().Name);
			if (nomineeName === $.trim(oldNomineeName))
			{
				var nodeName = nominee.name();
				nomineeRef = nomineesRef.child(nodeName);
				nomineeRef.update({ Name: $.trim(newNomineeName) });
				displayNomineeEditedSuccessMsg();
			}
		});
	});
}

function displayNomineeEditedSuccessMsg()
{
	$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails')
		.empty();
	$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails')
		.hide();
	$('div#divEditElectionDetails fieldset#editExisting div#editExistingVoter')
		.show();
	$('div#divEditElectionDetails fieldset#editExisting div#editExistingNominee')
		.show();
	$('div#divEditElectionDetails fieldset#editExisting div.formee-msg-success')
		.append('<h3>Nominee Edited!</h3>');
	$('div#divEditElectionDetails fieldset#editExisting div.formee-msg-success')
		.show();
}

function createVotersList(votersRef)
{

	var voterList = $('<select></select>');
	voterList.attr('class', 'formee-medium');
	votersRef.once('value', function(votersSnapshot) {
		votersSnapshot.forEach(function(voter) {
			var voterName = voter.val().Name;
			voterList.append('<option>' + voterName + '</option>');
		});
		voterList.appendTo('div#divEditElectionDetails div#editExistingVoter');
		var btnSubmitVoter = $('<button>CHOOSE</button>');
		$(btnSubmitVoter).attr('class', 'formee-button');
		$(btnSubmitVoter).click(function() {
			displayVoterDetail($(voterList), votersRef);
			return false;
		})
		$(btnSubmitVoter).appendTo($('div#divEditElectionDetails div#editExistingVoter'));
	});
}

function displayVoterDetail(selectedVoter, votersRef)
{
	var selectedVoterName = $.trim($(selectedVoter).find(':selected').text());
	votersRef.once('value', function(votersSnapshot) {
		votersSnapshot.forEach(function(voter) {
			if ($.trim(voter.val().Name) === $.trim(selectedVoterName))
			{
				alert("were going to display details for " + voter.val().Name);
			}
		});
	});
}*/

function changeElectionDetails(electionRef, newElectionName, newNumberToElect)
{
    if ($.trim(newElectionName) !== '' && checkIsInteger(newNumberToElect)) {
        electionRef.update({ Name: newElectionName, NumberToElect: newNumberToElect });
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').empty();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').empty();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').append('<h3>Election Details Changed!</h3>');
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').hide();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').show();
    } else if ($.trim(newElectionName) === '') {
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').empty();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').empty();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').append('<h3>Please Enter an Election Name!</h3>');
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').hide();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').show();
    } else {
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').empty();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').empty();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').append('<h3>Please Enter a Valid Number to Elect (integer)!</h3>');
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').hide();
        $('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').show();
    }
}

function createAndAppendEditElectionNameTextField(electionName) 
{
	var txtElectionName = $('<input />');
	$(txtElectionName).attr({
		id: 'txtElectionName',
		type: 'text', 
		value: electionName,
		'class': 'formee-large formee-equal'
	});
	$('div#divEditElectionDetails div#electionName').empty();
	$('div#divEditElectionDetails div#electionName').show();
	$(txtElectionName).appendTo($('div#divEditElectionDetails div#electionName'));
	return txtElectionName;
}

function createAndAppendSubmitButton(electionRef, txtEditElectionName, txtEditNumberToElect)
{
	var btnSubmitNumToElectEdit = $('<button>SUBMIT</button>');
	$(btnSubmitNumToElectEdit).attr('class', 'formee-button formee-equal');
	$(btnSubmitNumToElectEdit).click(function() {
		changeElectionDetails(electionRef, txtEditElectionName.val() ,txtEditNumberToElect.val());
		return false;
	});
	$('div#divEditElectionDetails div#submitElectionChanges').empty();
	$('div#divEditElectionDetails div#submitElectionChanges').show();
	$(btnSubmitNumToElectEdit).appendTo($('div#divEditElectionDetails div#submitElectionChanges'));
}

function createAndAppendEditNumberToElect(numberToElect)
{
	var txtNumberToElect = $('<input />');
	$(txtNumberToElect).attr({
		id: 'txtNumberToElect',
		type: 'text',
		value: numberToElect,
		'class': 'formee-large formee-equal'
	});
	$('div#divEditElectionDetails div#numberToElect').empty();
	$('div#divEditElectionDetails div#numberToElect').show();
	$(txtNumberToElect).appendTo($('div#divEditElectionDetails div#numberToElect'));
	return txtNumberToElect;
}

function createPoll(pollsRef) 
{
	var pollName = $.trim($('#txtCreatePoll').val());
	if (pollName == "" || pollName == null)
	{
		$('div#divCreatePoll div.formee-msg-error').empty();
		$('div#divCreatePoll div.formee-msg-error').append('<h3>Please Enter a Poll Name</h3>');
		$('div#divCreatePoll div.formee-msg-error').show();
		return;
	}
	else 
	{
		//TODO add error callback
		var curPoll;
		pollsRef.once('value', function(curPollSnapshot) {
			// Get current total number of polls
			var numPollsObj = curPollSnapshot.val();
			var numPolls = numPollsObj.NumPolls;

			// Generate current poll name based on number of polls + 1
			//var curPollKey = 'Poll' + (parseInt(numPolls)+1);

			curPoll = pollsRef.push();
			curPoll.set({Name: pollName, NumElections: 0});
			curElections = curPoll.child('Elections');

			// Now we've added a new poll, we must increment the number of polls
			numPolls++;
			pollsRef.update({NumPolls: numPolls});
			hidePollsAndShowElections(curPoll);
		});
	}
}

function addElection(pollRef)
{
    var startDate = $('div#divCreateElections input#datePickerStart').val();
    var endDate = $('div#divCreateElections input#datePickerEnd').val();

	// Get the div which should contain the new election name and number of candidates to elect - 
	// should always be numbered one more than the number of numElections, since the div exists to
	// create a *new* election
	var electionName = $.trim($('div#divCreateElections input#txtCreateElection').val());
	var numberToElect = $.trim($('div#divCreateElections input#txtNumElect').val());

	// Lets verify that numPolls is actually an integer
	var isInteger = checkIsInteger(numberToElect);

	if (electionName == "" || electionName == null)
	{
		alert("You must enter a name for your election!");
		return;
	}
	else if (!isInteger)
	{
		alert('Please select a valid number of candidates!');
		return false;
	}
	else if (!pollDatesValid(startDate, endDate)) {
	    alert("Please enter valid begin and end dates for your poll!");
	    return false;
	}
	else
	{
	    numberToElect = parseInt(numberToElect);
	    var electionsRef = pollRef.child('Elections');
	    pollRef.once('value', function (curPollSnapshot) {
	        // Get assigned number of elections for the current poll
	        var numElectionsObj = curPollSnapshot.val();
	        var numElections = numElectionsObj.NumElections;

	        // Now we push the new election name and number of candidates to the elections ref 
	        // we created in addPoll(), representing a list of elections for the current poll
	        //var  curElectionKey = 'Election' + (parseInt(numElections)+1);
	        electionRef = electionsRef.push();
	        electionRef.set({ Name: electionName, NumberToElect: numberToElect, NumNominations: 0, NumVoters: 0 });

	        // If we get here we know we are about to add an election, so we must increment 
	        // the current polls NumElections
	        numElections++;
	        pollRef.update({ NumElections: numElections, StartDate: startDate, EndDate: endDate });

	        // Create a tasty nominations ref for later
	        //curNominations = curElection.child('Nominations');
	        //hideElectionsShowVoters(electionRef);
	        $('div#divCreateElections').hide();
	        $('div#divEditPoll').hide();
	        votersAddedShowNominations(electionRef);
	    });
	}
}

function pollDatesValid(startDate, endDate) {
    var nowDate = new Date();
    nowDate = (nowDate.getMonth() + 1) + '/' + nowDate.getDate() + '/' + nowDate.getFullYear();
    var startDateArry = startDate.split("/");
    var endDateArry = endDate.split("/");
    var nowDateArry = nowDate.split("/");
    if (parseInt(startDateArry[2]) > parseInt(endDateArry[2])) {
        alert("Starting year greater than ending year!");
        return false;
    } else if (parseInt(startDateArry[2]) == parseInt(endDateArry[2]) &&
        parseInt(startDateArry[0]) > parseInt(endDateArry[0])) {
        alert("Starting month after ending month!");
        return false;
    } else if (parseInt(startDateArry[2]) == parseInt(endDateArry[2]) &&
        parseInt(startDateArry[0]) == parseInt(endDateArry[0]) &&
        parseInt(startDateArry[1]) > parseInt(endDateArry[1])) {
        alert("Starting day after ending day!");
        return false;
    } else if (!compareDates(nowDateArry, startDateArry)) {
        alert("Voters cannot travel back in time!");
        return false;
    } else if (!compareDates(nowDateArry, endDateArry)) {
        alert("Voters cannot travel back in time!");
        return false;
    } else {
        return true;
    }
}

function compareDates(date1, date2) {
    if (parseInt(date1[2]) > parseInt(date2[2])) {
        return false;
    } else if (parseInt(date1[2]) == parseInt(date2[2]) &&
        parseInt(date1[0]) > parseInt(date2[0])) {
        return false;
    } else if (parseInt(date1[2]) == parseInt(date2[2]) &&
        parseInt(date1[0]) == parseInt(date2[0]) &&
        parseInt(date1[1]) > parseInt(date2[1])) {
        return false;
    } else {
        return true;
    }
}


function addElectionWithParams(pollRef, electionName, numberToElect) {
    // Get the div which should contain the new election name and number of candidates to elect - 
    // should always be numbered one more than the number of numElections, since the div exists to
    // create a *new* election
    var isInteger = checkIsInteger(numberToElect);

    if (electionName == "" || electionName == null) {
        alert("You must enter a name for your election!");
        return;
    }
    else if (!isInteger) {
        alert('Please select a valid number of candidates!');
        return false;
    }
    else {
        numberToElect = parseInt(numberToElect);
        var electionsRef = pollRef.child('Elections');
        pollRef.once('value', function (curPollSnapshot) {
            // Get assigned number of elections for the current poll
            var numElectionsObj = curPollSnapshot.val();
            var numElections = numElectionsObj.NumElections;

            // Now we push the new election name and number of candidates to the elections ref 
            // we created in addPoll(), representing a list of elections for the current poll
            //var  curElectionKey = 'Election' + (parseInt(numElections)+1);
            electionRef = electionsRef.push();
            electionRef.set({ Name: electionName, NumberToElect: numberToElect, NumNominations: 0, NumVoters: 0 });

            // If we get here we know we are about to add an election, so we must increment 
            // the current polls NumElections
            numElections++;
            pollRef.update({ NumElections: numElections });

            // Create a tasty nominations ref for later
            //curNominations = curElection.child('Nominations');
            hideElectionsShowVoters(electionRef);
        });
    }
}

//function showAddVoters(electionRef)
//{
//    // Remove old buttons
//    $('div#divAddVoters div#buttons').empty();
//    $('div#appendVoterName > input#txtAddName:not(:first)').remove();
//    $('div#appendVoterName > input#txtAddName').val('');
//    $('div#appendVoterName > label:not(:first)').remove();
//    $('div#appendVoterNumber > input#txtAddNumber:not(:first)').remove();
//    $('div#appendVoterNumber > input#txtAddNumber').val('');
//    $('div#appendVoterNumber > label:not(:first)').remove();
//	var btnAddVoters = $('<button>ADD VOTER</button>');
//	var btnSubmitVoters = $('<button>SUBMIT VOTER(S)</button>');
//	$(btnAddVoters).attr({
//		id: 'btnAddVoters', 
//		'class': 'formee-button'
//	});
//	$(btnAddVoters).click(function() {
//		addVoter();
//		return false;
//	});
//	$(btnSubmitVoters).attr({
//		id: 'btnSubmitVoters',
//		'class': 'formee-button'
//	});
//	$(btnSubmitVoters).click(function() {
//		submitVoters(electionRef);
//		return false;
//	});
//	$('div#divAddVoters div#buttons').append($(btnAddVoters));
//	$('div#divAddVoters div#buttons').append($(btnSubmitVoters));
//	$('div#divAddVoters').show();
//	$('div#divAddVoters *').show();
//	$('div#divAddVoters div.formee-msg-success').hide();
//	$('div#divAddVoters div.formee-msg-error').hide();
//}

/*function submitNominations()
{
	// curElection should already be set to the current election from addElection() 
	curElection.once('value', function(curElectionSnapshot) {

		var numNominationsObj = curElectionSnapshot.val();
		var numNominations = numNominationsObj.NumNominations;

		// Loop through each entered nominee name
		$('div#appendNominations > input.txtAddNomination').each(function() {
			var nomineeName = $(this).val();
			if (nomineeName == "" || nomineeName == null)
			{
				alert("You must enter a nominee name!");
				return;
			}
			else 
			{
				// Generate a key for the nominee based on the number of nominees already 
				// in the database
				var curNominationKey = 'Nominee' + (parseInt(numNominations)+1);
				var curNomination = curNominations.child(curNominationKey);
				curNomination.set({Name: nomineeName, NumberOfVotes: 0});

				// Number of nominations has just been increased by one, so update
				numNominations++;
				curElection.update({NumNominations: numNominations});

			}
		});
		nominationsAddedShowOptions();
	});
}*/

//function submitVoters(electionRef)
//{
//    if (existingVoterFieldsValid()) {
//        var votersRef = electionRef.child('Voters');
//        electionRef.once('value', function (electionSnapshot) {
//            var numVoters = parseInt(electionSnapshot.val().NumVoters);
//            $('div#appendVoterName > input#txtAddName').each(function (index) {
//                var voter = $.trim($(this).val());
//                var numObj = $('div#appendVoterNumber > input#txtAddNumber').eq(index);
//                var num = $.trim(numObj.val());
//                num = num.replace(/-/g, "");
//                var voterRef = votersRef.push();
//                voterRef.set({ Name: voter, Number: num })
//                numVoters++;
//                electionRef.update({ NumVoters: numVoters });
//                //getElectionsStr(electionsRef, numElections, voter, num, voterKey, voterRef);
//            });
//        });
//        votersAddedShowNominations(electionRef);
//    }
//}

function submitVotersWithParams(electionRef, voterName, voterNumber) {
    if ($.trim(voterName) === "")
    {
        // Throw error
        alert("Please enter valid name");
    } else if (!checkIsValidPhoneNumber(voterNumber)) {
        // Throw error
        alert("Please enter valid phone number");
    } else {
        var votersRef = electionRef.child('Voters');
        electionRef.once('value', function (electionSnapshot) {
            var numVoters = parseInt(electionSnapshot.val().NumVoters);
            //var voter = $.trim($(this).val());
            //var numObj = $('div#appendVoterNumber > input#txtAddNumber').eq(index);
            //var num = $.trim(numObj.val());
            voterNumber = voterNumber.replace(/-/g, "");
            voterName = $.trim(voterName);
            var voterRef = votersRef.push();
            voterRef.set({ Name: voterName, Number: voterNumber })
            numVoters++;
            electionRef.update({ NumVoters: numVoters });
            displayElectionEditOptions(electionRef);
            //getElectionsStr(electionsRef, numElections, voter, num, voterKey, voterRef);
        });
        //displayVotersTable(electionRef);
        //votersAddedShowNominations(electionRef);
    }
}

///////////////////////////////////////////////////////////////////
// DOM MANIPULATION FUNCTIONS	
///////////////////////////////////////////////////////////////////
/*function showElectionDetails(electionRef)
{
	$('div#divEditPoll').hide();
	$('div#divEditElectionDetails').show();
	$('div#divEditElectionDetails div.formee-msg-success').hide();
	$('div#divEditElectionDetails div.formee-msg-error').hide();
	$('div#divEditElectionDetails div.formee-msg-error').hide();
	$('div#divEditElectionDetails fieldset#editExisting div#nomineeDetails').hide();
	$('div#divEditElectionDetails fieldset#editExisting div#voterDetails').hide();
	populateElectionDetailFields(electionRef);
}*/

function returnHome()
{
	/*$('div#divCreateElections').hide();
	$('div#divAddNomination').hide();
	$('div#divEditElectionDetails').hide();
	$('div#divAddVoters').hide();
	$('div#divOptions').hide();*/
	$('div:not(div#divCreatePoll)').hide();
	$('div#divCreatePoll').show();
	$('div#divCreatePoll *').show();
	$('div#divCreatePoll div.formee-msg-error').hide();
	$('div#homeDiv').show();
	$('div#homeDiv *').show();
}

function hideSelectPollFieldsetAndShowEditPollFieldsets()
{
	$('div#divEditPoll fieldset#selectPoll').hide();
	$('div#divEditPoll fieldset#changePollName').show();
	$('div#divEditPoll fieldset#selectElection').show();
	$('div#divEditPoll fieldset#changePollName div.formee-msg-success').hide();
	$('div#divEditPoll fieldset#changePollName div.formee-msg-error').hide();
}

function hideCreatePollShowEditPoll()
{
	$('div#divCreatePoll').hide();
	$('div#divEditPoll').show();
	$('div#divEditPoll *').show();
	$('div#divEditPoll div.formee-msg-success').hide();
	$('div#divEditPoll fieldset#changePollName').hide();
	$('div#divEditPoll fieldset#selectElection').hide();
}

function hidePollDetailsShowElectionDetails()
{
	$('div#divEditPoll').hide();
	$('div#divEditElectionDetails').show();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success').hide();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error').hide();
	$('div#divEditElectionDetails fieldset#editExisting').hide();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success').hide();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-error').hide();
	$('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-success').hide();
	$('div#divEditElectionDetails fieldset#editElectionDetails div.formee-msg-error').hide();
}

function displayNomineeRemovedSuccessMsg(nomineeName)
{
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.empty();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.append('<h3>Nominee ' + nomineeName + ' Removed!');
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.show();
}

function displayEmptyVoterNameErrorMsg()
{
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.hide();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error')
		.empty();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error')
		.append('<h3>Please Enter a Valid Voter Name</h3>');
	$('div#divEditElectionDetails fieldset#addVoter div.formee-msg-error')
		.show();
}

function displayVoterNumberErrorMsg()
{
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.hide();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error')
		.empty();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error')
		.append('<h3>Please Enter a Valid Voter Phone Number</h3>');
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error')
		.show();
}

function displayVoterNameAndNumberChangedSuccessMsg()
{
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-error')
		.hide();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.empty();
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.append('<h3>Voter Name and Number Successfully Changed!</h3>');
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.show();
}

function displayEmptyNomineeNameError()
{
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.hide();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-error')
		.empty();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-error')
		.append('<h3>Please Enter a Valid Nominee Name</h3>');
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-error')
		.show();
}

function displayNomineeNameChangedSuccessMsg()
{
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.hide();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-error')
		.hide();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.empty();
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.append('<h3>Nominee Name Successfully Changed!</h3>');
	$('div#divEditElectionDetails fieldset#addNominations div.formee-msg-success')
		.show();
}

function displayVoterRemovedSuccessMsg(voterName)
{
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.append('<h3>Voter ' + voterName + ' Removed!');
	$('div#divEditElectionDetails fieldset#addVoters div.formee-msg-success')
		.show();
}

/*function showPollRemovedSuccessMsg(removedPoll)
{
	$('div#divEditPoll fieldset#changePollName div.formee-msg-success').append('<h3>Poll ' + removedPoll + ' Removed!</h3>');
	$('div#divEditPoll fieldset#changePollName div.forme
e-msg-success').show();
}
function showElectionRemovedSuccessMsg(electionName)
{
	$('div#divEditPoll fieldset#selectElection div.formee-msg-success').append('<h3>Election ' + electionName + ' Removed!</h3>');
	$('div#divEditPoll fieldset#selectElection div.formee-msg-success').show();
}*/

//function hideElectionsShowVoters(electionRef)
//{
//    $('div#divCreateElections').hide();
//    $('div#divEditPoll').hide();
//	showAddVoters(electionRef);
//}

/*function votersAddedShowElections()
{
	$('div#divAddVoters').hide();
	$('div#divCreateElections').show();
}*/

function hidePollsAndShowElections(pollRef)
{
	$('div#divCreatePoll').hide();
	formatElectionsDiv();
	var btnSubmitElection = $('<button>CREATE ELECTION</button>');
	$(btnSubmitElection).attr({
		id: 'btnSubmitElection',
		'class': 'formee-button'
	});
	$(btnSubmitElection).click(function() {
		addElection(pollRef);
		return false;
	});
	$('div#divCreateElections div#submitButton').append($(btnSubmitElection));
	var myDatePicker = $('#datePickerStart');
	myDatePicker.datepicker();
	$('#datePickerEnd').datepicker();
	$('div#divCreateElections').show();
	$('div#divCreateElections *').show();
}

function votersAddedShowNominations(electionRef) 
{
	$('div#divAddVoters').hide();
	formatAndDisplayNominationsDiv(electionRef);
}

function addNomination()
{
    if (existingNomineeFieldsValid()) {
        $('fieldset#appendNominations div#appendNominations').append("<label>Name</label><input type='text'" +
                    "class='txtAddNomination' value='' />");
    } 
}

function addVoter()
{
	if (existingVoterFieldsValid()) 
	{
		$('fieldset#appendVoters div#appendVoterName').append("<label>Voter Name</label><input type='text'" +  
						"class='formee-large' id='txtAddName' value='' />");
		$('fieldset#appendVoters div#appendVoterNumber').append("<label>Voter Phone Number</label>" +
					    "<input type='text' id='txtAddNumber' value='' class='formee-large' />");
	} 
}

function existingNomineeFieldsValid() {
    if (!nomineeNamesValid()) {
        // display nominee name error
        $('fieldset#appendNominations div.formee-msg-success').empty();
        $('fieldset#appendNominations div.formee-msg-error').empty();
        $('fieldset#appendNominations div.formee-msg-error').append("<h3>Please Enter a Valid Nominee Name!</h3>");
        $('fieldset#appendNominations div.formee-msg-success').hide();
        $('fieldset#appendNominations div.formee-msg-error').show();
        return false;
    } else {
        // display success message
        $('fieldset#appendNominations div.formee-msg-success').empty();
        $('fieldset#appendNominations div.formee-msg-error').empty();
        $('fieldset#appendNominations div.formee-msg-success').append("<h3>New Nominee Added!</h3>");
        $('fieldset#appendNominations div.formee-msg-success').show();
        $('fieldset#appendNominations div.formee-msg-error').hide();
        return true;
    }
}

function nomineeNamesValid() {
    var valid = true;
    $('fieldset#appendNominations div#appendNominations input').each(function () {
        if ($.trim($(this).val()) === "") {
            valid = false;
        }
    });
    return valid;
}

function existingVoterFieldsValid()
{
	if (!voterNamesValid()) 
	{
		// Display voter name error message
		$('fieldset#appendVoters div.formee-msg-success').hide();
		$('fieldset#appendVoters div.formee-msg-error').empty();
		$('fieldset#appendVoters div.formee-msg-error').append('<h3>Please Enter All Voter Names</h3>');
		$('fieldset#appendVoters div.formee-msg-error').show();
		return false;
	}
	else if (!voterNumbersValid())
	{
		// Display number error message
		$('fieldset#appendVoters div.formee-msg-success').hide();
		$('fieldset#appendVoters div.formee-msg-error').empty();
		$('fieldset#appendVoters div.formee-msg-error').append('<h3>Please Enter Only Valid Phone Numbers (xxx-xxx-xxxx)</h3>');
		$('fieldset#appendVoters div.formee-msg-error').show();
		return false;
	}
	else 
	{
		// Display success message
		$('fieldset#appendVoters div.formee-msg-error').hide();
		$('fieldset#appendVoters div.formee-msg-success').empty();
		$('fieldset#appendVoters div.formee-msg-success').append('<h3>Voter Added!</h3>');
		$('fieldset#appendVoters div.formee-msg-success').show();
		return true;
	}
}

function voterNamesValid()
{
	var valid = true;
	$('fieldset#appendVoters div#appendVoterName input').each(function() {
		if ($.trim($(this).val()) === "")
		{
			valid = false;
		}
	});
	return valid;
}

function voterNumbersValid()
{
	var valid = true;
	$('fieldset#appendVoters div#appendVoterNumber input').each(function() {
		if (!checkIsValidPhoneNumber($.trim($(this).val())))
		{
			valid = false;
		}
	});
	return valid;
}

/*function increaseFieldSetSize(divName)
{
	var height = $('fieldset#' + divName).css('height');
	height = height.replace(/px$/, '');
	height = parseInt(height) + 70;
	height = height + "px";
	$('fieldset#' + divName).css('height', height);
}

function decreaseFieldSetSize(divName) 
{
	$('fieldset#' + divName).css({'height': "30%"});
}*/

/*function nominationsAddedShowOptions(electionRef)
{
    $('div#divAddNomination').hide();
    formatAndDisplayOptions(electionRef);
}*/

/*function formatAndDisplayOptions(electionRef)
{
    $('div#divOptions').();

}*/

function formatPollsDiv()
{
	$('div#divOptions').hide();
	$('div#divEditPoll').hide();
	$('div#divAddNomination').hide();
	$('div#divCreatePoll input#txtCreatePoll').val('');
	formatElectionsDiv();
	formatVotersDiv();
	formatNominationsDiv();
	$('div#divCreatePoll').show();
	$('div#divCreatePoll *').show();
	$('div#divCreatePoll div.formee-msg-error').hide();
}

function formatElectionsDiv()
{
	$('div#divCreateElections input#txtCreateElection').val('');
	$('div#divCreateElections input#txtNumElect').val('');
	$('div#divCreateElections div#submitButton').empty();
	formatVotersDiv();
	formatNominationsDiv();
}

/*function formatAndDisplayElectionsDiv()
{
	formatElectionsDiv();
	$('div#divOptions').hide();
	formatVotersDiv();
	displayElectionsDiv();
}

function displayElectionsDiv()
{
	$('div#divCreateElections').show();
}*/

function formatNominationsDiv(electionRef) 
{
	// Remove all nomination textboxes except the first and empty contents
	// in case some have already been added
	$('div#appendNominations > input.txtAddNomination:not(:first)').remove();
	$('div#appendNominations > label:not(:first)').remove();
	$('div#appendNominations > input.txtAddNomination').val('');
	var btnAddNomination = $('<button>ADD NOMINATION</button>');
	var btnSubmitNominations = $('<button>SUBMIT NOMINATIONS</button>');
	btnAddNomination.attr({
	    id: 'btnAddNomination',
	    'class': 'formee-button'
	});
	btnSubmitNominations.attr({
	    id: 'btnSubmitNominations',
	    'class': 'formee-button'
	});
	btnAddNomination.click(function () {
	    addNomination();
	    return false;
	});
	btnSubmitNominations.click(function () {
	    submitNominations(electionRef);
	    return false;
	});
	$('fieldset#appendNominations *').show();
	$('fieldset#appendNominations div.formee-msg-success').hide();
	$('fieldset#appendNominations div.formee-msg-error').hide();
	$('fieldset#appendNominations div.grid-12-12').empty();
	btnAddNomination.appendTo('fieldset#appendNominations div.grid-12-12');
	btnSubmitNominations.appendTo('fieldset#appendNominations div.grid-12-12');
}

function formatAndDisplayNominationsDiv(electionRef)
{
	formatNominationsDiv(electionRef);
	$('div#divOptions').hide();
	displayNominationsDiv();
}

function formatVotersDiv()
{
	$('div#appendVoterName > input.txtAddVoter:not(:first)').remove();
	$('div#appendVoterName > label:not(:first)').remove();
	$('div#appendVoterName > input.txtAddVoter').val('');
	$('div#appendVoterNumber > input.txtAddNumber:not(:first)').remove();
	$('div#appendVoterNumber > label:not(:first)').remove();
	$('div#appendVoterNumber > input.txtAddNumber').val('');
	//decreaseFieldSetSize("appendVoters");
	formatNominationsDiv();
}

function displayNominationsDiv()
{
	$('div#divAddNomination').show();
}

///////////////////////////////////////////////////////////////////
// VALIDATION FUNCTIONS
///////////////////////////////////////////////////////////////////
function checkIsInteger(possibleInt)
{
	if (parseFloat(possibleInt) == parseInt(possibleInt) && !isNaN(possibleInt))
	{
		return true;
	} 
	else 
	{
		return false;
	}
}