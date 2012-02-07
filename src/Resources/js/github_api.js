jQuery.noConflict();
var GitHubAPI = Class.create(API, {
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
			projects[i++] = new GitHubProject(name, description);
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
			issue.project = new GitHubProject(project, "");
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
	convertIssueToJSON: function(issue) {
		var dataToSend = '{';
		dataToSend += '"title": "'+issue.title+'",';
		dataToSend += '"body": "'+issue.description+'"';
		if (issue.milestone != null) {
			dataToSend += ',"milestone": "'+issue.milestone.id+'"';
		}
		if (issues.state == 1) {
			dataToSend += ',"state": "open"';
		} else {
			dataToSend += ',"state": "closed"';	
		}
		if (issue.labels.length > 0) {
			dataToSend += '",labels": [';
			var first = true;
			issue.labels.each(function(label) {
				if (first) {
					dataToSend += '"'+label+'"';
				} else {
					dataToSend += ',"'+label+'"';
				}				
			});
			dataToSend += ']';
		}
		dataToSend += '}';
		
		return dataToSend;
	},
	convertProjectToJSON: function(project) {
		var dataToSend = '{';
		dataToSend += '"name": "'+project.name+'",';
		dataToSend += '"description": "'+project.description+'"';
		dataToSend += '}';
		
		return dataToSend;
	},
	convertMilestoneToJSON: function(milestone) {
		var dataToSend = '{';
		dataToSend += '"title": "'+milestone.title+'",';
		dataToSend += '"description": "'+milestone.description+'"';
		if (milestone.date != "") {
			dataToSend += ',"due_on": "'+milestone.date+'"';
		}
		dataToSend += '}';
		
		return dataToSend;
	},
	editIssue: function(issue, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + issue.project + "/issues/" + issue.id;		
		var dataToSend = this.convertIssueToJSON(issue);
		
		this.ajaxClient.sendData(requestURL, "PATCH", dataToSend, this.confirmEditIssue, callback);
	},
	confirmEditIssue: function(json, callback) {
		var message = "Issue edited";
		callback(message);
	},
	addIssue: function(issue, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + issue.project + "/issues";		
		var dataToSend = this.convertIssueToJSON(issue);
		
		this.ajaxClient.sendData(requestURL, "POST", dataToSend, this.confirmCreateIssue, callback);		
	},
	confirmCreateIssue: function(json, callback) {
		var message = json.number;
		callback(message);
	},
	deleteIssue: function(issue, callback) {
		callback("Not allowed");
	},
	addProject: function(project, callback) {
		var requestURL = "https://api.github.com/user/repos";
		var dataToSend = this.convertProjectToJSON(project);
		
		this.ajaxClient.sendData(requestURL, "POST", dataToSend, this.confirmCreateProject, callback);
	},
	confirmCreateProject: function(json, callback) {
		var message = "Project created: " + json.name;
		callback(message);
	},
	editProject: function(project, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + project.name;
		var dataToSend = this.convertProjectToJSON(project);
		
		this.ajaxClient.sendData(requestURL, "PATCH", dataToSend, this.confirmEditProject, callback);
	},
	confirmEditProject: function(json, callback) {
		var message = "Project changed: " + json.name;
		callback(message);
	},
	deleteProject: function(project, callback) {
		callback("Not allowed");
	},
	getLabels: function(issue, callback) {
		requestURL = "https://api.github.com/repos/" + this.username + "/" + project.name + "/issues/" + issue.id;
		
		this.ajaxClient.sendRequest(requestURL, "GET", this.parseLabels, callback, "");
	},
	parseLabels: function(json, callback, project) {
		callback(json.labels);
	},
	getMilestones: function(project, callback) {
		requestURL = "https://api.github.com/repos/" + this.username + "/" + project.name + "/milestones";
		
		this.ajaxClient.sendRequest(requestURL, "GET", this.parseMilestones, callback, project);
	},
	parseMilestones: function(json, callback, project) {
		var ms, id, title, project;
		var milestones = new Array();
		var i = 0;
		json.each(function(item) {
			id = item.number;
			title = item.title;			
			milestones[i++] = new Milestone(id, title, "", project.name);
		});
		callback(milestones);
	},
	addMilestone: function(milestone, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + milestone.project + "/milestones";
		var dataToSend = this.convertMilestoneToJSON(milestone);
		
		this.ajaxClient.sendData(requestURL, "POST", dataToSend, this.confirmCreateMilestone, callback);
	},
	confirmCreateMilestone: function(json, callback) {
		var message = "Milestone created";
		callback(message);
	},
	editMilestone: function(milestone, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + milestone.project + "/milestones/" + milestone.id;
		var dataToSend = this.convertMilestoneToJSON(milestone);
		
		this.ajaxClient.sendData(requestURL, "PATCH", dataToSend, this.confirmEditMilestone, callback);
	},
	confirmEditMilestone: function(json, callback) {
		var message = "Milestone updated";
		callback(message);
	},
	deleteMilestone: function(milestone, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + milestone.project + "/milestones/" + milestone.id;
		
		this.ajaxClient.sendRequest(requestURL, "DELETE", this.confirmDeleteMilestone, callback, "");
	},
	confirmDeleteMilestone: function(json, callback) {
		var message = "Milestone removed";
		callback(message);
	}
});