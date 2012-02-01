jQuery.noConflict();
var GitHubAPI = Class.create({
	auth: "",
	username: "",
	ajaxClient: null,
	initialize: function(_username, _auth) {
		this.username = _username;
		this.auth = _auth;
		this.ajaxClient = new Ajax_client(_username, _auth);
	},
	getProjects: function(callback) {
		var requestURL = "https://api.github.com/users/" + this.username + "/repos";
		
		this.ajaxClient.sendRequest(requestURL, "GET", this.parseProjects, callback);
	},
	parseProjects: function(json, callback) {
		var project,name, description;
		var projects = new Array();
		var i = 0;			
		json.each(function(repo) {
			name = repo.name;
			description = repo.description;
			projects[i++] = new Project(name, description);
		});
		callback(projects);
	},
	getIssues: function(project, callback) {
		requestURL = "https://api.github.com/repos/" + this.username + "/" + project.name + "/issues";
		this.ajaxClient.sendRequest(requestURL, "GET", this.parseIssues, callback, project.name);
	},
	parseIssues: function(json, callback, project) {
		var issue, id, title, description;
		var issues = new Array();
		var i = 0;
		json.each(function(item){
			id = item.number;
			title = item.title;
			description = item.body;
			issue = new Issue(id, title, description);
			issue.project = project;
			issues[i++] = issue;
		});
		callback(issues);
	},
	getUsers: function(project, callback) {
		requestURL = "https://api.github.com/repos/" + this.username + "/" + project.name + "/collaborators";
		this.ajaxClient.sendRequest(requestURL, "GET", this.parseUsers, callback, project.name);
	},
	parseUsers: function(json, callback, project) {
		var id, name, email;
		var users = new Array();
		var i = 0;
		json.each(function(item){
			name = item.login;
			id = item.id;
			email = "";
			users[i++] = new User(name, email, project);
		});
		callback(issues);
	},
	editIssue: function(issue, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + issue.project + "/issues/" + issue.id;
		
		/**
		 * @todo zmenit
		 */
		var dataToSend = '{"state": "closed"}';
		
		client = Titanium.Network.createHTTPClient();
		client.onload = function() {
			/**
			 * @todo zmenit
			 */
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
	},
	addIssue: function(issue, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + issue.project + "/issues";
		
		/**
		 * @todo zmenit
		 */
		var dataToSend = '{"title": "' + title + '"}';
		
		client = Titanium.Network.createHTTPClient();
		client.onload = function() {		
			/**
			 * @todo zmenit
			 */
			callback(this.responseText);
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
});