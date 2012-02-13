/**
 * @author saterond
 */
var GTDModel = Class.create({
	db: null,
	initialize: function(_db) {
		this.db = _db;
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
		var rs = null,project,name,description;
		if ('project_id' in params) {			
			var projectID = parseInt(params["project_id"]);
			rs = this.db.execute('SELECT name,description,type From project WHERE project_id = ? LIMIT 1', projectID);			
		} else {
			Titanium.API.error("Zatim nelze issues filtrovat jinak nez podle project_id");
			return null;
		}
		if(rs.rowCount() == 0) {
			this.showMessage('Projekt s ID #' + project_id + ' nebyl nalezen');
			return null;
		} else {
			name = rs.fieldByName('name');
			description = rs.fieldByName('description');			
			project = new Project(name, description);
			project.type = rs.fieldByName('type');			
		}
		return project;
	},
	getIssues: function(params) {
		var issuesRS = null;
		if ('project_id' in params) {			
			var projectID = parseInt(params["project_id"]);
			issuesRS = this.db.execute("SELECT id,title,description,issue_id,state,status,project_type FROM Issue WHERE project_id = ?", projectID);			
		} else {			
			Titanium.API.error("Zatim nelze issues filtrovat jinak nez podle project_id");
			return new Array();
		}
		var issues = new Array(), i = 0, id, title, description, issue;
		var paramss = new Object();
		while (issuesRS.isValidRow()) {			
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
			issue.text2 = issuesRS.fieldByName('text2');
			issue.local = issuesRS.fieldByName('local');
			
			labels[i++] = label;
			labelsRS.next();
		}		
		labelsRS.close();
		return labels;
	},
	getMilestone: function() {
		
	}
});