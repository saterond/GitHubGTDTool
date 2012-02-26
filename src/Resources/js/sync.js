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
				this.assembla.getMilestones(project, this.saveMilestonesToDatabase);
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
		var issue_id = this.saveIssueInDatabase(issue);
		issue.issue_id = issue_id;
		switch(issue.project_type) {
			case 1:
				if (issue.id != 0) {
					this.assembla.editIssue(issue, this.showMessage);
				} else {
					this.assembla.addIssue(issue, this.saveIssueNumberInDatabase);
				}				
				break;
			case 2:				
				if (issue.id != 0) {
					this.gcode.editIssue(issue, this.showMessage);
				} else {					
					this.gcode.addIssue(issue, this.saveIssueNumberInDatabase);	
				} 
				break;
			case 3:
				if (issue.id != 0) {
					this.github.editIssue(issue, this.showMessage);
				} else {
					this.github.addIssue(issue, this.saveIssueNumberInDatabase);	
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
		var milestoneID = null;
		if (issue.milestone != null) {
			milestoneID = this.saveMilestoneToDatabase(issue.milestone, issue.project.project_id);
		}
		if (issue.issue_id != 0) {
			db.execute(
				'UPDATE Issue SET id = ?, title = ?, description = ?, status = ?, project_id = ?, milestone_id = ?, inbox = ? WHERE issue_id = ?'
				, issue.id, issue.title, issue.description, issue.status, issue.project.project_id, milestoneID, issue.inbox, issue.issue_id);
		} else {			
			db.execute(
				'INSERT INTO Issue (id, title, description, status, project_type, project_id, milestone_id, inbox) VALUES (?,?,?,?,?,?,?,?)'
				, issue.id, issue.title, issue.description, issue.status, issue.project_type, issue.project.project_id, milestoneID, issue.inbox);
			issue.issue_id = db.lastInsertRowId;
		}		
		if (issue.labels.length != 0) {
			this.saveLabelsToDatabase(issue.labels, issue.issue_id);
		}
		return issue.issue_id;
	},
	saveIssuesToDatabase: function(issues) {		
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null, id, title, description, status, projectType, projectID = null, milestoneID;
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
			rs = db.execute('SELECT issue_id FROM Issue WHERE id = ? AND project_type = ?', 
							id, projectType);
			if(rs.rowCount() == 0) {
				db.execute('INSERT INTO Issue (id, title, description, status, project_type, project_id) VALUES (?,?,?,?,?,?)', 
							id, title, description, status, projectType, projectID);
				issue.issue_id = db.lastInsertRowId;
			} else {
				db.execute('UPDATE Issue SET title = ?, description = ?, status = ?, project_id = ? WHERE id = ? AND project_type = ?', 
							title, description, status, projectID, id, projectType);
				issue.issue_id = rs.fieldByName('issue_id');
			}
			if (issue.labels.length != 0) {
				Titanium.API.get("sync").saveLabelsToDatabase(issue.labels, issue.issue_id);
			}
			milestoneID = null;
			if (issue.milestone != null) {
				milestoneID = Titanium.API.get("sync").saveMilestoneToDatabase(issue.milestone, projectID);
				db.execute("UPDATE Issue SET milestone_id = ? WHERE issue_id = ?", milestoneID, issue.issue_id);
			}
		});
		if (projectType != 1 && projectID != null) {
			var viewer = Titanium.API.get("viewer");
			viewer.reloadIssues(projectID);
		}
	},
	saveLabelsToDatabase: function(labels, issue_id) {
		var rs = null;
		labels.each(function(label) {
			rs = Titanium.API.get("app").db.execute("SELECT label_id FROM Label WHERE issue_id = ? AND text = ?", issue_id, label);
			if (rs.rowCount() == 0) {
				if (label.search(":") == -1) {
					Titanium.API.get("app").db.execute("INSERT INTO Label (text,issue_id,local) VALUES (?,?,?)", label, issue_id, 1);
				} else {
					var texts = label.split(":");
					Titanium.API.get("app").db.execute("INSERT INTO Label (text,text2,issue_id,local) VALUES (?,?,?,?)", texts[0], texts[1], issue_id, 1);
				}
			} else if (label.search(":") != -1) {
				var texts = label.split(":");
				rs = Titanium.API.get("app").db.execute("SELECT label_id FROM Label WHERE issue_id = ? AND text = ? AND text2 = ?", issue_id, texts[0], texts[1]);
				if (rs.rowCount() == 0) {
					Titanium.API.get("app").db.execute("INSERT INTO Label (text,text2,issue_id,local) VALUES (?,?,?,?)", texts[0], texts[1], issue_id, 1);
				}
			}
		});
	},
	saveIssueNumberInDatabase: function(issue) {
		if (issue.issue_id != 0) {
			var app = Titanium.API.get("app");
			var db = app.getDb();
			db.execute("UPDATE Issue SET id = ? WHERE issue_id = ?", issue.id, issue.issue_id);
		}
	},
	saveMilestoneToDatabase: function(milestone, projectID) {
		console.log(milestone);
		var rs = Titanium.API.get("app").db.execute("SELECT milestone_id FROM Milestone WHERE title = ? AND project_id = ? LIMIT 1", milestone.title, projectID);
		var milestoneID = 0;
		if (rs.rowCount() == 0) {
			Titanium.API.get("app").db.execute("INSERT INTO Milestone (id,title,date,project_id) VALUES (?,?,?,?)", milestone.id, milestone.title, milestone.date, projectID);
			milestoneID = Titanium.API.get("app").db.lastInsertRowId;
		} else {
			milestoneID = rs.fieldByName("milestone_id");
		}
		return milestoneID;
	},
	saveMilestonesToDatabase: function(milestones, projectName, projectType) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null, id, title, date, milestoneID, project_id;
		rs = db.execute("SELECT project_id FROM project WHERE name = ? AND type = ?", projectName, projectType);
		project_id = rs.fieldByName("project_id");
		milestones.each(function(milestone) {
			rs = db.execute("SELECT milestone_id FROM Milestone WHERE id = ? AND project_id = ?", milestone.id, project_id);
			if (rs.rowCount() > 0) {
				milestoneID = rs.fieldByName("milestone_id");
				db.execute("UPDATE Milestone SET title = ?, date = ? WHERE milestone_id = ?", milestone.title, milestone.date, milestoneID);
			} else {
				db.execute(
					"INSERT INTO Milestone (id,title,date,project_id) VALUES (?,?,?,?)",
					milestone.id, milestone.title, milestone.date, project_id
				);				
			}
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(project_id);
	}
});
