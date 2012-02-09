var Sync = Class.create({
	config : [],
	db : null,
	assembla: null,
	gcode: null,	
	github: null,
	initialize : function(config, database) {
		this.config = config;
		this.db = database;		
		//this.gcode = new GCodeAPI(this.config.gcode.email, this.config.gcode.password);
		//this.gcode.username = this.config.gcode.name;
		this.assembla = new AssemblaAPI(this.config.assembla.name, this.config.assembla.password, this.config.assembla.user_id);
		this.github = new GitHubAPI(this.config.github.name, this.config.github.auth);
	},
	showMessage: function(message) {
		var viewer = Titanium.API.get("viewer");
		viewer.showMessage(message);
	},
	syncProjects: function() {
		/*
		var project = new Project("gtd-developer-tasks", "");
		var milestone = new Milestone(1, "App test", "2012-04-10T08:00:00Z", project.name);
		var issue = new Issue("1", "Volání API", "changed from application");
		issue.project = "gtd-developer-tasks";
		issue.state = 0;
		*/
		this.assembla.getProjects(this.saveProjectsToDatabase);
		this.gcode.getProjects(this.saveProjectsToDatabase);
		this.github.getProjects(this.saveProjectsToDatabase);
	},
	syncIssues: function(project) {
		switch(project.type) {
			case 1: 
				this.assembla.getIssues(project, this.saveIssuesToDatabase); 
				break;
			case 2:
				this.gcode.getIssues(project, this.saveIssuesToDatabase); 
				break;
			case 3:
				this.github.getIssues(project, this.saveIssuesToDatabase); 
				break;
			default:
				Titanium.API.error("Nepodporovany typ projektu (sync)");
		}
	},
	saveIssue: function(issue) {
		this.saveIssueInDatabase(issue);
		switch(issue.project.type) {
			case 1:
				if (issue.id != 0) {
					this.assembla.editIssue(issue, this.showMessage);
				} else {
					this.assembla.addIssue(issue, this.saveIssueInDatabase);	
				}				
				break;
			case 2:
				if (issue.id != 0) {
					this.gcode.editIssue(issue, this.showMessage);
				} else {
					this.gcode.addIssue(issue, this.saveIssueInDatabase);	
				} 
				break;
			case 3:
				if (issue.id != 0) {
					this.github.editIssue(issue, this.showMessage);
				} else {
					this.github.addIssue(issue, this.saveIssueInDatabase);	
				} 
				break;
			default:
				Titanium.API.error("Nepodporovany typ projektu");
		}
	},
	saveProjectsToDatabase: function(projects) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null;
		projects.each(function(project) {
			rs = db.execute('SELECT project_id FROM project WHERE name = ? AND type = ?', project.name, project.type);
			if(rs.rowCount() == 0)
				db.execute('INSERT INTO project (name,description,type) VALUES (?,?,?)', project.name, project.description, project.type);
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadProjects();
	},
	saveIssueInDatabase: function(issue) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		if (issue.issue_id != 0) {
			db.execute(
				'UPDATE Issue SET id = ? AND title = ? AND description = ? AND status = ? AND project_id = ? WHERE issue_id = ?'
				, issue.id, issue.title, issue.description, issue.status, issue.project.project_id, issue.issue_id);
		} else {
			db.execute(
				'INSERT INTO Issue (id, title, description, status, project_type, project_id) VALUES (?,?,?,?,?,?)'
				, issue.id, issue.title, issue.description, issue.status, issue.project_type, issue.project.project_id);
		}
	},
	saveIssuesToDatabase: function(issues) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null, id, title, description, status, projectType, projectID = null;
		issues.each(function(issue) {
			if (projectID == null) {
				rs = db.execute('SELECT project_id FROM project WHERE type = ? AND name = ? ', issue.project.type, issue.project.name);
				projectID = rs.fieldByName('project_id');
			}
			id = issue.id;
			title = issue.title;			
			description = issue.description;
			status = issue.status;
			projectType = issue.project.type;
			rs = db.execute('SELECT issue_id FROM Issue WHERE id = ? AND project_type = ?', id, projectType);
			if(rs.rowCount() == 0) {
				db.execute('INSERT INTO Issue (id, title, description, status, project_type, project_id) VALUES (?,?,?,?,?,?)', id, title, description, status, projectType, projectID);
			} else {
				db.execute('UPDATE Issue SET id = ? AND title = ? AND description = ? AND status = ? AND project_id = ? WHERE id = ? AND project_type = ?', id, title, description, status, projectID, id, projectType);
			}
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(projectID);
	},
	getProject: function(project_id) {
		var rs = null,project,name,description;
		rs = this.db.execute('SELECT * From project WHERE project_id = ? LIMIT 1', project_id);
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
	getIssue: function(issue_id) {
		var rs = null,issue,id,title,description;
		rs = this.db.execute('SELECT * From Issue WHERE issue_id = ? LIMIT 1', issue_id);
		if(rs.rowCount() == 0) {
			this.showMessage('Issue s ID #' + issue_id + ' nebyla nalezena');
			return null;
		} else {
			id = rs.fieldByName('id');
			title = rs.fieldByName('title');
			description = rs.fieldByName('description');
			issue = new Issue(id, title, description);
			issue.status = rs.fieldByName('status');
			issue.project_type = rs.fieldByName('project_type');
			issue.project = this.getProject(rs.fieldByName('project_id'));
		}
		return issue;
	}
});
