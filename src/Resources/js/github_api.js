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
	jQuery.ajax({
		url: requestURL,		
		data: dataToSend,
		type: "PATCH",
		beforeSend : function(req) {
            req.setRequestHeader('Authorization', auth);
       	},
		success: function(response) {			
			callback(response, id);
		}					 
	});
}
