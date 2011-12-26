jQuery.noConflict();

function GitHubAPI(){}

GitHubAPI.Repos = function(username, callback){
	requestURL = "https://api.github.com/users/" + username + "/repos?callback=?";
	jQuery.ajax({
		url: requestURL,
		dataType: "jsonp",
		success: function(response) {
			Titanium.API.info("Done loading repos");
			callback(response);			
		},
		error: function(e) {
			Titanium.API.info("Error with loading repos");
		}
	});
}

GitHubAPI.Issues = function(username, repo, callback){
	requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/issues?callback=?";
	jQuery.ajax({
		url: requestURL,
		dataType: "jsonp",
		success: function(response) {
			console.log(response);
			callback(response, repo);
		}					 
	});
}

GitHubAPI.IssuesClosed = function(username, repo, callback){
	requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/issues?callback=?";
	var dataToSend = {"state": "closed"};
	jQuery.ajax({
		url: requestURL,
		data: dataToSend,
		dataType: "jsonp",
		type: "GET",
		success: function(response) {
			console.log(response);
			callback(response, repo);
		}					 
	});
}

GitHubAPI.ProjectUsers = function(username, repo, callback) {
	requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/collaborators";
	console.log("URL: " + requestURL);
	jQuery.ajax({
		url: requestURL,
		dataType: "jsonp",
		data: "callback=?",
		success: function(response) {
			console.log(response);
			callback(response);						
		}					 
	});
}

GitHubAPI.CloseIssue = function(auth, username, repo, id, callback) {	
	var requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/issues/" + id;
	var dataToSend = '{"state": "closed"}';
	client = Titanium.Network.createHTTPClient();
	client.onload = function() {
		callback(repo, this.responseText);
	}
	client.onerror = function() {
		Titanium.API.info("error");
	}
	if (!client.open("PATCH", requestURL, true)) {
		Titanium.API.info("spojeni se nepodarilo");
	}
	client.setRequestHeader('Authorization', auth);
	if (!client.send(dataToSend)) {
		Titanium.API.info("data nebyla odeslana");
	}	
}

GitHubAPI.SaveNewIssue = function(auth, username, repo, title, callback) {	
	var requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/issues";
	var dataToSend = '{"title": "' + title + '"}';
	client = Titanium.Network.createHTTPClient();
	client.onload = function() {		
		callback(repo, this.responseText);
	}
	client.onerror = function() {
		Titanium.API.info("error");
	}
	if (!client.open("POST", requestURL, true)) {
		Titanium.API.info("spojeni se nepodarilo");
	}
	client.setRequestHeader('Authorization', auth);
	if (!client.send(dataToSend)) {
		Titanium.API.info("data nebyla odeslana");
	}
}
