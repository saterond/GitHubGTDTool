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
		var issue, id, title, description, labels, milestone;
		var issues = new Array();
		var i = 0, j = 0;
		if (json.each != undefined)
			json.each(function(item){
				id = item.number;
				title = item.title;
				description = item.body;
				issue = new Issue(id, title, description);
				issue.project = new GitHubProject(project, "");
				issue.state = (item.state == "open") ? 1 : 0;
				
				j = 0;
				labels = new Array();
				item.labels.each(function(label) {
					labels[j++] = new Label(0, 0, label.name);
				});
				issue.labels = labels;
				
				milestone = null;
				if (item.milestone != null) {
					milestone = new Milestone(0, item.milestone.title, item.milestone.due_on, 0);
				}
				issue.milestone = milestone;
				
				user = null;
				if (item.assignee != null) {
					user = new User(item.assignee.login, "", 0);
				}
				issue.user = user;
				
				issues[i++] = issue;
			});
		callback(issues);
	},
	getUsers: function(project, callback) {
		requestURL = "https://api.github.com/repos/" + this.username + "/" + project.name + "/collaborators";
		
		this.ajaxClient.sendRequest(requestURL, "GET", this.parseUsers, callback, project);
	},
	parseUsers: function(json, callback, project) {
		var id, name, email, user;
		var users = new Array();
		var i = 0;
		json.each(function(item){
			name = item.login;
			id = item.id;
			email = "";
			user = new User(name, email, project);
			user.id = id;
			users[i++] = user;
		});
		callback(users, project);
	},
	convertIssueToJSON: function(issue) {
		var dataToSend = '{';
		dataToSend += '"title": "'+issue.title+'",';
		dataToSend += '"body": "'+issue.description+'"';
		if (issue.milestone != null && issue.milestone.id != 0) {
			dataToSend += ',"milestone": "'+issue.milestone.id+'"';
		}
		if (issue.state == 1) {
			dataToSend += ',"state": "open"';
		} else {
			dataToSend += ',"state": "closed"';	
		}
		if (issue.user != null && issue.user.id != 0) {
			dataToSend += ',"assignee": "' + issue.user.name + '"';
		}
		if (issue.labels.length < 1) {
			dataToSend += ',"labels": [';
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
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + issue.project.name + "/issues/" + issue.id;		
		var dataToSend = this.convertIssueToJSON(issue);
		
		this.ajaxClient.sendData(requestURL, "PATCH", dataToSend, this.confirmEditIssue, callback);
	},
	confirmEditIssue: function(json, callback) {
		var message = "Issue edited";
		callback(message);
	},
	addIssue: function(issue, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + issue.project.name + "/issues";		
		var dataToSend = this.convertIssueToJSON(issue);
		
		this.ajaxClient.sendData(requestURL, "POST", dataToSend, this.confirmCreateIssue, callback, issue.issue_id);
	},
	confirmCreateIssue: function(json, callback, issue_id) {
		var issue = new Issue(json.number, json.title, json.body);
		issue.issue_id = issue_id;
		
		callback(issue);
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
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + project.old_name;
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
		var ms, id, title;
		var milestones = new Array();
		var i = 0;
		json.each(function(item) {
			id = item.number;
			title = item.title;			
			milestones[i++] = new Milestone(id, title, "", project);
		});
		callback(milestones, project);
	},
	addMilestone: function(milestone, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + milestone.project.name + "/milestones";
		var dataToSend = this.convertMilestoneToJSON(milestone);
		
		this.ajaxClient.sendData(requestURL, "POST", dataToSend, this.confirmCreateMilestone, callback);
	},
	confirmCreateMilestone: function(json, callback) {
		var message = "Milestone created";
		callback(message);
	},
	editMilestone: function(milestone, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + milestone.project.name + "/milestones/" + milestone.id;
		var dataToSend = this.convertMilestoneToJSON(milestone);
		
		this.ajaxClient.sendData(requestURL, "PATCH", dataToSend, this.confirmEditMilestone, callback);
	},
	confirmEditMilestone: function(json, callback) {
		var message = "Milestone updated";
		callback(message);
	},
	deleteMilestone: function(milestone, callback) {
		var requestURL = "https://api.github.com/repos/" + this.username + "/" + milestone.project.name + "/milestones/" + milestone.id;
		
		this.ajaxClient.sendRequest(requestURL, "DELETE", this.confirmDeleteMilestone, callback, "");
	},
	confirmDeleteMilestone: function(json, callback) {
		var message = "Milestone removed";
		callback(message);
	}
});