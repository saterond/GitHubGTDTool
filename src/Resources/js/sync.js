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
	getParamsObject: function(key, value) {
		var obj = new Object();
		obj[key] = value;
		return obj;
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
				this.assembla.getUsers(project, this.saveUsersToDatabase);
				break;
			case 2:
				this.gcode.getIssues(project, this.saveIssuesToDatabase);
				this.gcode.getUsers(project, this.saveUsersToDatabase);
				break;
			case 3:
				this.github.getIssues(project, this.saveIssuesToDatabase); 
				break;
			default:
				Titanium.API.error("Nepodporovany typ projektu (sync)");
		}
	},
	syncUsers: function() {
		var sync = Titanium.API.get("sync");
		var projects = Titanium.API.get("projects");
		projects.each(function(project) {
			switch(project.type) {
				case 1: 					
					sync.assembla.getUsers(project, sync.saveUsersToDatabase);
					break;
				case 2:
					sync.gcode.getUsers(project, sync.saveUsersToDatabase);
					break;
				case 3:					
					sync.github.getUsers(project, sync.saveUsersToDatabase);
					break;
			}
		});
	},
	saveIssue: function(issue) {
		/*if (issue.user != null && issue.user.user_id == 0) {
			var user_id = this.model.saveUser(issue.user);
			issue.user.user_id = user_id;
		}*/
		var issue_id = this.model.saveIssue(issue);
		issue.issue_id = issue_id;
		switch(issue.project_type) {
			case 1:
				if (issue.id != 0) {
					this.assembla.editIssue(issue, this.showMessage);
				} else {
					this.assembla.addIssue(issue, this.model.saveIssueNumber);
				}				
				break;
			case 2:				
				if (issue.id != 0) {
					this.gcode.editIssue(issue, this.showMessage);
				} else {					
					this.gcode.addIssue(issue, this.model.saveIssueNumber);	
				} 
				break;
			case 3:
				if (issue.id != 0) {
					this.github.editIssue(issue, this.showMessage);
				} else {
					this.github.addIssue(issue, this.model.saveIssueNumber);	
				}
				break;
		}
		
		var viewer = Titanium.API.get("viewer");
		if (viewer.isProjectActive(issue.project.project_id)) {
			if (issue.project.project_id != 0)
				viewer.reloadIssues(issue.project.project_id);
			else
				viewer.loadSelection(this.getParamsObject("selection", 1));
		}
	},
	saveProject: function(project) {
		var isNewProject = (project.project_id == 0);		
		this.model.saveProject(project);
		switch(project.type) {
			case 1:
				if (!isNewProject) {
					this.assembla.editProject(project, this.showMessage);
				} else {
					this.assembla.addProject(project, this.showMessage);
				}				
				break;
			case 2:				
				if (!isNewProject) {
					this.gcode.editProject(project, this.showMessage);
				} else {					
					this.gcode.addProject(project, this.showMessage);	
				} 
				break;
			case 3:
				if (!isNewProject) {					
					this.github.editProject(project, this.showMessage);
				} else {
					this.github.addProject(project, this.showMessage);
				}
				break;
		}
		
		var viewer = Titanium.API.get("viewer");
		viewer.reloadProjects();
	},
	saveProjectsToDatabase: function(projects) {
		var app = Titanium.API.get("app");
		var sync = Titanium.API.get("sync");
		var db = app.getDb();
		var rs = null;
		projects.each(function(project) {
			project.project_id = this.model.saveProject(project);
			switch(project.type) {
				case 1: 
					sync.assembla.getMilestones(project, sync.saveMilestonesToDatabase);
					sync.assembla.getUsers(project, sync.saveUsersToDatabase);
					break;
				case 2:
					sync.gcode.getUsers(project, sync.saveUsersToDatabase);
					break;
				case 3:
					sync.github.getMilestones(project, sync.saveMilestonesToDatabase);
					sync.github.getUsers(project, sync.saveUsersToDatabase);
					break;
			}
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadProjects();
	},
	saveIssuesToDatabase: function(issues) {
		var model = Titanium.API.get("model");
		var projectType, projectID = null, project;
		issues.each(function(issue) {
			if (projectID == null && (issue.project == null || issue.project.project_id == 0)) {
				var params = new Object();
				params["project_type"] = issue.project.type;
				params["project_name"] = issue.project.name;
				project = model.getProject(params);
				projectType = project.type;
				projectID = project.project_id;
			} else if (issue.project != null && issue.project.project_id != 0) {
				project = issue.project;
				projectType = project.type;
				projectID = project.project_id;
			}
			if (issue.milestone != null && projectType != 1)
				model.saveMilestone(issue.milestone, projectID);
			if (issue.user != null)
				model.saveUser(issue.user, projectID);
			issue.project = project;
			model.saveIssue(issue);
		});
		if (projectID != null && projectID != 0) {
			var viewer = Titanium.API.get("viewer");
			viewer.reloadIssues(projectID);
		}
	},
	saveMilestonesToDatabase: function(milestones, project) {
		var model = Titanium.API.get("model");
		var viewer = Titanium.API.get("viewer");
		var project_id = project.project_id;
		milestones.each(function(milestone) {
			model.saveMilestone(milestone, project_id);
		});		
		viewer.reloadIssues(project_id);
	},
	saveUsersToDatabase: function(users, project) {
		var model = Titanium.API.get("model");
		users.each(function(user){
			model.saveUser(user, project.project_id);
		});
	},
	closeIssue: function(issue_id) {
		var app = Titanium.API.get("app");
		var sync = Titanium.API.get("sync");
		var issue = sync.model.getIssue(sync.getParamsObject("issue_id", issue_id));
		issue.state = 0;
		issue.closed_on = app.getSQLDate(0);
		sync.saveIssue(issue);
	}
});