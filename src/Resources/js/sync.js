var Sync = Class.create({
	config : [],
	db : null,
	assembla: null,
	gcode: null,	
	github: null,
	model: null,
	initialize : function(config, database, model) {
		this.config = config;
		this.db = database;		
		this.model = model;
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
			issue.issue_id = db.lastInsertRowId;
		}
		if (issue.labels.length != 0) {
			this.saveLabelsToDatabase(issue.labels, issue.issue_id);
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
				issue.issue_id = db.lastInsertRowId;
			} else {
				db.execute('UPDATE Issue SET id = ? AND title = ? AND description = ? AND status = ? AND project_id = ? WHERE id = ? AND project_type = ?', id, title, description, status, projectID, id, projectType);
				issue.issue_id = rs.fieldByName('issue_id');
			}
			if (issue.labels.length != 0) {
				this.saveLabelsToDatabase(issue.labels, issue.issue_id);
			}
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(projectID);
	},
	saveLabelsToDatabase: function(labels, issue_id) {
		var rs = null;
		labels.each(function(label) {
			rs = this.db.execute("SELECT label_id FROM Label WHERE issue_id = ? AND text = ?", issue_id, label);
			if (rs.rowCount() == 0) {
				if (label.search(":") == -1) {
					this.db.execute("INSERT INTO Label (text,issue_id,local) VALUES (?,?,?)", label, issue_id, 1);
				} else {
					var texts = label.split(":");
					this.db.execute("INSERT INTO Label (text,text2,issue_id,local) VALUES (?,?,?,?)", texts[0], texts[1], issue_id, 1);
				}
			} else if (label.search(":") != -1) {
				var texts = label.split(":");
				rs = this.db.execute("SELECT label_id FROM Label WHERE issue_id = ? AND text = ? AND text2 = ?", issue_id, texts[0], texts[1]);
				if (rs.rowCount() == 0) {
					this.db.execute("INSERT INTO Label (text,text2,issue_id,local) VALUES (?,?,?,?)", texts[0], texts[1], issue_id, 1);
				}
			}
		});
	}
});
