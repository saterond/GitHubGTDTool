/**
 * @author saterond
 */
var GTDModel = Class.create({
	db: null,
	initialize: function(_db) {
		this.db = _db;
	},
	getParamsObject: function(key, value) {
		var obj = new Object();
		obj[key] = value;
		return obj;
	},
	getProjects: function() {
		var projectsRS = this.db.execute("SELECT * FROM Project");				
		var projects = new Array(), i = 0, id, name, type, project, description;
		while (projectsRS.isValidRow()) {			
			id = projectsRS.fieldByName('project_id');
			name = projectsRS.fieldByName('name');
			description = projectsRS.fieldByName('description');
			type = projectsRS.fieldByName('type');
			project = new Project(name, description);
			project.type = type;
			project.project_id = id;
			projects[i++] = project;
			projectsRS.next();
		}
		projectsRS.close();
		return projects;
	},
	getProject: function(params) {
		var viewer = Titanium.API.get("viewer");
		var rs = null,project,name,description;
		if ('project_id' in params) {			
			var projectID = parseInt(params["project_id"]);
			rs = this.db.execute('SELECT name,description,type From project WHERE project_id = ? LIMIT 1', projectID);			
		} else {
			Titanium.API.error("Zatim nelze issues filtrovat jinak nez podle project_id");
			return null;
		}
		if(rs.rowCount() == 0) {
			viewer.showMessage('Projekt s ID #' + projectID + ' nebyl nalezen');
			return null;
		} else {
			name = rs.fieldByName('name');
			description = rs.fieldByName('description');			
			project = new Project(name, description);
			project.type = rs.fieldByName('type');
			project.project_id = projectID;
		}
		return project;
	},
	getIssues: function(params) {
		var issuesRS = null;
		if ('project_id' in params) {			
			var projectID = parseInt(params["project_id"]);
			issuesRS = this.db.execute("SELECT id,title,description,issue_id,state,status,project_type,milestone_id FROM Issue WHERE project_id = ?", projectID);			
		} else if ('inbox' in params) {
			var inbox = parseInt(params["inbox"]);
			issuesRS = this.db.execute("SELECT id,title,description,issue_id,state,status,project_type,milestone_id FROM Issue WHERE inbox = ?", inbox);
		} else {
			Titanium.API.error("Zatim nelze issues filtrovat podle techto parametru");
			return new Array();
		}
		var issues = new Array(), i = 0, id, title, description, issue, milestone_id;
		var paramss = new Object();
		while (issuesRS.isValidRow()) {			
			id = issuesRS.fieldByName('id');
			title = issuesRS.fieldByName('title');
			description = issuesRS.fieldByName('description');
			milestone_id = issuesRS.fieldByName('milestone_id');
			
			issue = new Issue(id, title, description);
			issue.issue_id = issuesRS.fieldByName('issue_id');
			issue.state = issuesRS.fieldByName('state');
			issue.status = issuesRS.fieldByName('status');
			issue.project_type = issuesRS.fieldByName('project_type');
			issue.labels = this.getLabels(this.getParamsObject("issue_id", issue.issue_id));
			console.log("done loading labels");
			issue.milestone = this.getMilestone(this.getParamsObject("milestone_id", milestone_id))
			console.log("done loading milestones");
			issues[i++] = issue;
			issuesRS.next();
		}
		issuesRS.close();
		return issues;
	},
	getIssue: function(params) {
		var issuesRS = null;
		if ('issue_id' in params) {			
			var issueID = parseInt(params["issue_id"]);
			issuesRS = this.db.execute('SELECT * From Issue WHERE issue_id = ? LIMIT 1', issueID);		
		} else {			
			Titanium.API.error("Zatim nelze issues vyhledavat jinak nez podle issue_id");
			return new Array();
		}
		var id, title, description, issue = null;
		var paramss = new Object();
		if (issuesRS.rowCount() > 0) {			
			id = issuesRS.fieldByName('id');
			title = issuesRS.fieldByName('title');
			description = issuesRS.fieldByName('description');
			
			issue = new Issue(id, title, description);
			issue.issue_id = issuesRS.fieldByName('issue_id');
			issue.state = issuesRS.fieldByName('state');
			issue.status = issuesRS.fieldByName('status');
			issue.project_type = issuesRS.fieldByName('project_type');
			
			paramss["issue_id"] = issue.issue_id;
			issue.labels = this.getLabels(paramss);
		}
		issuesRS.close();
		return issue;
	},
	getLabels: function(params) {
		var labelsRS = null;
		if ('issue_id' in params) {			
			var issueID = parseInt(params["issue_id"]);
			labelsRS = this.db.execute("SELECT label_id,text,text2,local FROM Label WHERE issue_id = ?", issueID);
		} else {
			Titanium.API.error("Zatim nelze labely filtrovat jinak nez podle issue_id");
			return new Array();
		}
		var labels = new Array(), i = 0, id, text, label;
		while (labelsRS.isValidRow()) {			
			id = labelsRS.fieldByName('label_id');
			text = labelsRS.fieldByName('text');
			
			label = new Label(id, issueID, text);
			label.text2 = labelsRS.fieldByName('text2');
			label.local = labelsRS.fieldByName('local');
			
			labels[i++] = label;
			labelsRS.next();
		}		
		labelsRS.close();
		return labels;
	},
	getMilestone: function(params) {
		var milestoneRS = null, milestone = null, title, date, project_id, id;
		if ('milestone_id' in params) {			
			var milestoneID = parseInt(params["milestone_id"]);
			milestoneRS = this.db.execute("SELECT project_id,date,title FROM Milestone WHERE milestone_id = ?", milestoneID);
		} else {
			Titanium.API.error("Milestones nelze filtrovat jinak nez podle milestone_id");
			return null;
		}
		if (milestoneRS.rowCount() > 0) {
			id = milestoneRS.fieldByName('id');
			title = milestoneRS.fieldByName('title');
			date = milestoneRS.fieldByName('date');
			project_id = milestoneRS.fieldByName('project_id');
			
			milestone = new Milestone(id, title, date, project_id);
			milestone.milestone_id = milestoneID;
		}
		return milestone;
	},
	getMilestonePercent: function(params) {
		var milestoneRS = null, active, count;
		if ('milestone_id' in params) {			
			var milestoneID = parseInt(params["milestone_id"]);
			milestoneRS = Titanium.API.get("app").db.execute("SELECT count(issue_id) as activeCount FROM Issue WHERE milestone_id = ? AND state = 1", milestoneID);
			if (milestoneRS.rowCount() > 0) {
				active = parseInt(milestoneRS.fieldByName("activeCount"));
				milestoneRS = Titanium.API.get("app").db.execute("SELECT count(issue_id) as allCount FROM Issue WHERE milestone_id = ?", milestoneID);
				count = parseInt(milestoneRS.fieldByName("allCount"));
				milestoneRS.close();
				return (active * 100) / count;
			} else {
				milestoneRS.close();
				return 0;
			}
		} else {
			Titanium.API.error("Milestones nelze filtrovat jinak nez podle milestone_id");
			return 0;
		}
	},
	saveProject: function(project) {
		var app = Titanium.API.get("app");
		var db = app.db;
		if (project.project_id == 0) {
			db.execute("INSERT INTO project (name,description,type) VALUES (?,?,?)", 
						project.name, project.description, project.type);
		} else {
			db.execute("UPDATE project SET name = ?, description = ? WHERE project_id = ?",
						project.name, project.decription, project.project_id);
		}
		var viewer = Titanium.API.get("viewer");
		viewer.reloadProjects();
	}
});