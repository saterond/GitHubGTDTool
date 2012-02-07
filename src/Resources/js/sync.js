var Sync = Class.create({
	config : [],
	db : null,
	assembla: null,
	gcode: null,	
	github: null,
	initialize : function(config, database) {
		this.config = config;
		this.db = database;
		this.gcode = new GCodeAPI("ondrej.satera@gmail.com", "2abc5jkl");
		this.gcode.username = "ondrej.satera";
		this.assembla = new AssemblaAPI("p4nther", "bubenec", "dQpdNOrd8r4zqWacwqjQYw");
		this.github = new GitHubAPI(this.config.username, this.config.auth);
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
					this.assembla.addIssue(issue, this.saveNewIssueToDatabase);	
				}				
				break;
			case 2:
				if (issue.id != 0) {
					this.gcode.editIssue(issue, this.showMessage);
				} else {
					this.gcode.addIssue(issue, this.saveNewIssueToDatabase);	
				} 
				break;
			case 3:
				if (issue.id != 0) {
					this.github.editIssue(issue, this.showMessage);
				} else {
					this.github.addIssue(issue, this.saveNewIssueToDatabase);	
				} 
				break;
			default:
				Titanium.API.error("Nepodporovany typ projektu");
		}
	},
	saveProjectsToDatabase: function(projects) {
		//ztracime kontext objektu, musime ziskat databazi rucne
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
		
	},
	saveIssuesToDatabase: function(issues) {
		//ztracime kontext objektu, musime ziskat databazi rucne
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
	saveNewIssueToDatabase: function(issue) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		//db.execute("INSERT INTO Issue (title, user_id, project_name, gh_id) VALUES (?,?,?)", title, 1, repo, number);
	}	
});
