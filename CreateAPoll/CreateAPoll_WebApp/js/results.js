///////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
///////////////////////////////////////////////////////////////////////////////
//function setProcedureForPollChanged(pollsRef)
//{
//    pollsRef.on('child_changed', function (childSnapshot) {
//        var changedRef = childSnapshot.ref();
//    });
//}

function displayPollResults(pollsRef)
{
	$('div#appendResults').empty();
	getPolls(pollsRef);
}

function getPolls(pollsRef)
{
	pollsRef.once('value', function(pollsSnapshot) {
		pollsSnapshot.forEach(function(poll) {
			var nodeName = poll.name();
			if (nodeName != "NumPolls")
			{
				var pollName = poll.val().Name;
				createPollForm(pollName, nodeName, pollsRef);
			}
		});
	});
}

function setProcedureForPollAdded(pollsRef) 
{
	pollsRef.on('child_changed', function(pollAddedSnapshot) {
		// Test if a new poll has been added/removed - if so, then
		// node NumPolls will have changed
		if (pollAddedSnapshot.name().trim() == "NumPolls")
		{
			displayPollResults(pollsRef);
		}
		else 
		{
		    // Do nothing, this isn't an added poll
		    var changedRef = pollAddedSnapshot.ref();
		    if (changedRef.parent().name() === "Elections") {
		        alert("Just added poll: " + pollAddedSnapshot.val().Name);
		    }
		}
	});
}

function setProcedureForElectionsEdited(pollsRef) {
    pollsRef.on('child_changed', function (electionEditedSnapshot) {

    });
}

function createPollForm(pollName, nodeName, pollsRef)
{
	var frm = $('<form></form>').addClass('formee');
	var fldset = $('<fieldset><legend>' + pollName + '</legend></fieldset>');
	$(fldset).appendTo($(frm));
	$(frm).appendTo($('div#appendResults'));
	var pollRef = pollsRef.child(nodeName);
	var electionsRef = pollRef.child("Elections");
	electionsRef.once('value', function(electionsSnapshot) {
		electionsSnapshot.forEach(function(electionsChild) {
			var nodeName = electionsChild.name();
			var electionName = electionsChild.val().Name;
			var numNominations = electionsChild.val().NumNominations;
			var tbl = createElectionTable(electionName, nodeName, electionsRef, numNominations);
			$(tbl).appendTo($(fldset));
			$(tbl).css('float', 'left');
			//resizeForm(frm, numNominations);
		});
	});
}

function createElectionTable(electionName, nodeName, electionsRef, numNominations)
{
	var tbl = createTable();
	createElectionTableHeader(tbl, electionName);
	createElectionTableBody(tbl, nodeName, electionsRef, numNominations);
	return tbl;
}

function createElectionTableHeader(table, electionName) 
{
	var thead = $(table).children('thead');
	var tr1 = $('<tr></tr>');
	var tr2 = $('<tr><th>Candidate</th><th>Votes</th></tr>');
	var electionHeader = $('<th>' + electionName + '</th>');
	$(electionHeader).attr('colspan', '2');
	$(tr1).append($(electionHeader));
	$(thead).append($(tr1));
	$(thead).append($(tr2));
}

function createElectionTableBody(tbl, electionNodeName, electionsRef, numNominations)
{
	var tbody = $(tbl).children('tbody');
	var electionRef = electionsRef.child(electionNodeName);
	var nominationsRef = electionRef.child('Nominations');
	nominationsRef.once('value', function(nominationsSnapshot) {
		nominationsSnapshot.forEach(function(nominationsChild) {
			var nominationRef = nominationsRef.child(nominationsChild.name());
			var nomineeName = nominationsChild.val().Name;
			var numberOfVotes = nominationsChild.val().NumberOfVotes;
			var tr = $('<tr></tr>');
			var nomTd = $('<td>' + nomineeName + '</td>')
			var votesTd = $('<td>' + numberOfVotes + '</td>');
			$(tr).append($(nomTd));
			$(tr).append($(votesTd));
			$(tr).appendTo($(tbody));
			nominationRef.on('child_changed', function(changedNomineeSnapshot) {
				var newNumberOfVotes = changedNomineeSnapshot.val();
				updateTableVotes(newNumberOfVotes, votesTd);
			});
		});
	});
}

function updateTableVotes(numberOfVotes, td)
{
	$(td).text(numberOfVotes + "");
}

function createTableHeader(tableRow, pollName)
{
	var th = document.createElement('th');
	th.appendChild(document.createTextNode(pollName));
	tableRow.appendChild(th);
}

/*function resizeForm(form, numNominations)
{
	var tables = $(form).find('table');
	$(tables).each(function() {
		if ($(form).children('input[type=hidden]').length > 0)
		{
			var maxNominations = parseInt($(form).children('input[type=hidden]').val());
			if (numNominations > maxNominations)
			{
				$(form).children('input[type=hidden]').val(numNominations);
				var height = $(form).children('fieldset').css('height');
				height = height.replace(/px$/, '');
				height = parseInt(height) + ((numNominations-1) * 70);
				height = height + "px";
				$(form).children('fieldset').css('height', height);
			}
		}
		else 
		{
			if (numNominations > 1) 
			{
				var height = $(form).children('fieldset').css('height');
				height = height.replace(/px$/, '');
				height = parseInt(height) + ((numNominations-1) * 40);
				height = height + "px";
				$(form).children('fieldset').css('height', height);
				var hiddenField = $('<input></input>');
				$(hiddenField).attr('type', 'hidden');
				$(hiddenField).val(numNominations);
				$(form).append($(hiddenField));
			}
		}
	});
}*/

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
	$(tbl).attr('id', 'gradient-style');
	return tbl;
}

function findElectionsAndSetElectionAddedEvent(pollsRef)
{
	pollsRef.once('value', function(pollsSnapshot) {
		pollsSnapshot.forEach(function(pollsChild) {
			if (pollsChild.name().trim() != "NumPolls")
			{
				// Now we know we have a poll
				var pollRef = pollsRef.child(pollsChild.name());
				setProcedureForElectionAdded(pollRef);
			}
		});
	});
}

function setProcedureForElectionAdded(pollRef)
{
	pollRef.on('child_changed', function(changedPollSnapshot) {
		var changedNodeName = changedPollSnapshot.name().trim();
		// We only take action if NumElections has been changed for 
		// the poll reference - i.e. if an election has been added to
		// or removed from the poll
		if (changedNodeName.match(/^NumElections$/).length > 0) {
		    var pollsRef = pollRef.parent();
		    // TODO - this is kind of a cheap move - should really have 
		    // this only affect the form in which the other elections in 
		    // this poll ref are contained, and simply add another election
		    // table to that, but this will do for now
		    displayPollResults(pollsRef);
		} else {
		    alert(changedPollSnapshot.re().parent().name());
		}
	});
}

function navigateToVote() {
    window.location = "vote.html";
    return false;
}
