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
	getProjects: function(params) {
		if (params == undefined) {
			var projectsRS = this.db.execute("SELECT * FROM project");
		} else if ('plabel' in params) {
			var label_text = params["plabel"];
			var projectsRS = this.db.execute(
				"SELECT * FROM project WHERE" + 
				" EXISTS (SELECT project_id FROM Label WHERE Label.project_id = project.project_id AND Label.text = ?)", label_text);
		} else {
			var projectsRS = this.db.execute("SELECT * FROM project");
		}
		var projects = new Array(), i = 0, id, name, type, project, description, area_id;
		while (projectsRS.isValidRow()) {			
			id = projectsRS.fieldByName('project_id');
			name = projectsRS.fieldByName('name');
			description = projectsRS.fieldByName('description');
			type = projectsRS.fieldByName('type');
			project = new Project(name, description);
			project.type = type;
			project.project_id = id;
			area_id = projectsRS.fieldByName('area_id');
			if (area_id != null) {
				project.area = this.getArea(this.getParamsObject("area_id", area_id));
			}
			projects[i++] = project;
			projectsRS.next();
		}
		projectsRS.close();
		return projects;
	},
	getProject: function(params) {
		var viewer = Titanium.API.get("viewer");
		var rs = null,project,name,description,area_id;
		if ('project_id' in params) {			
			var projectID = parseInt(params["project_id"]);
			rs = this.db.execute('SELECT name,description,type,state,area_id From project WHERE project_id = ? LIMIT 1', projectID);			
		} else if (('project_name' in params) && ('project_type' in params)) {
			var project_name = params["project_name"];
			var project_type = params["project_type"];
			rs = this.db.execute('SELECT project_id,name,description,type,state,area_id From project WHERE name = ? AND type = ? LIMIT 1', project_name, project_type);
			var projectID = rs.fieldByName('project_id');
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
			project.state = rs.fieldByName('state');
			project.labels = this.getLabels(this.getParamsObject("project_id", projectID));
			area_id = rs.fieldByName("area_id");
			if (area_id != null) {
				project.area = this.getArea(this.getParamsObject("area_id", area_id));
			} else {
				project.area = null;
			}
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
		} else if ('today' in params) {
			var datum = new Date();
			var month_really = datum.getMonth() + 1;
			var month = (month_really < 10) ? "0"+month_really : month_really;
			var day_really = datum.getDate();
			var day = (day_really < 10) ? "0"+day_really : day_really;
			var today = datum.getFullYear() + "-" + month + "-" + day;
			issuesRS = this.db.execute("SELECT id,title,description,issue_id,state,status,project_type,milestone_id FROM Issue WHERE dueDate = ?", today);
		} else if ('scheduled' in params) {			
			issuesRS = this.db.execute("SELECT id,title,description,issue_id,state,status,project_type,milestone_id FROM Issue WHERE dueDate <> ''");
		} else if ('label' in params) {
			var label_text = params["label"];
			issuesRS = this.db.execute(
				"SELECT id,title,description,issue_id,state,status,project_type,milestone_id FROM Issue WHERE issue_id IN "+
				"(SELECT issue_id FROM Label WHERE text = ?)", label_text);
		} else if ('archived' in params) {
			var archived = parseInt(params["archived"]);
			issuesRS = this.db.execute("SELECT id,title,description,issue_id,state,status,project_type,milestone_id FROM Issue WHERE archived = ?", archived);
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
			if (milestone_id != "")
				issue.milestone = this.getMilestone(this.getParamsObject("milestone_id", milestone_id))
			
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
			issuesRS = this.db.execute('SELECT id,title,description,state,status,user_id,project_id FROM Issue WHERE issue_id = ?', issueID);		
		} else {			
			Titanium.API.error("Zatim nelze issues vyhledavat jinak nez podle issue_id");
			return new Array();
		}
		var id, title, description, issue = null, project_id;
		var paramss = new Object();
		if (issuesRS.rowCount() > 0) {			
			id = issuesRS.fieldByName('id');
			title = issuesRS.fieldByName('title');
			description = issuesRS.fieldByName('description');
			
			issue = new Issue(id, title, description);
			issue.issue_id = issueID;
			issue.state = issuesRS.fieldByName('state');
			issue.status = issuesRS.fieldByName('status');			
			issue.user = this.getUser(this.getParamsObject("user_id", issuesRS.fieldByName('user_id')));
			project_id = issuesRS.fieldByName('project_id');
			if (project_id != 0) {
				issue.project = this.getProject(this.getParamsObject("project_id", project_id));
			} else {
				issue.project = new Project("", ""),
				issue.project.project_id = 0;
				issue.project.type = 0;
			}
			issue.project_type = issue.project.type;
			
			paramss["issue_id"] = issue.issue_id;
			issue.labels = this.getLabels(paramss);
		}
		issuesRS.close();
		return issue;
	},
	getTrashedIssues: function() {
		var issuesRS = this.db.execute("SELECT title,description,issue_id,state,status FROM Trash");
		var issues = new Array(), i = 0, id, title, description, issue, milestone_id;
		while (issuesRS.isValidRow()) {			
			title = issuesRS.fieldByName('title');
			description = issuesRS.fieldByName('description');
			
			issue = new Issue(0, title, description);
			issue.issue_id = issuesRS.fieldByName('issue_id');
			issue.state = issuesRS.fieldByName('state');
			issue.status = issuesRS.fieldByName('status');
			issue.project_type = issuesRS.fieldByName('project_type');
			issue.labels = this.getLabels(this.getParamsObject("issue_id", issue.issue_id));
			
			issues[i++] = issue;
			issuesRS.next();
		}
		issuesRS.close();
		return issues;
	},
	getLabel: function(label_id) {
		var rs = null, label = null, issue_id, project_id, text;
		rs = this.db.execute("SELECT issue_id,project_id,text,local,text2 From Label WHERE label_id = ?", label_id);
		if (rs.rowCount() > 0) {
			issue_id = rs.fieldByName("issue_id");
			project_id = rs.fieldByName("project_id");
			text = rs.fieldByName("text");
			label = new Label(label_id, issue_id, text, project_id);
			label.local = rs.fieldByName("local");
			label.text2 = rs.fieldByName("text2");
		}
		return label;
	},
	getLabels: function(params) {
		var labelsRS = null;
		if ('issue_id' in params) {			
			var issueID = parseInt(params["issue_id"]);
			var projectID = 0;
			labelsRS = this.db.execute("SELECT label_id,text,text2,local FROM Label WHERE issue_id = ?", issueID);
		} else if ('project_id' in params) {			
			var projectID = parseInt(params["project_id"]);
			var issueID = 0;
			labelsRS = this.db.execute("SELECT label_id,text,text2,local FROM Label WHERE project_id = ?", projectID);
		} else {
			Titanium.API.error("Zatim nelze labely filtrovat jinak nez podle issue_id a project_id");
			return new Array();
		}
		var labels = new Array(), i = 0, id, text, label;
		while (labelsRS.isValidRow()) {			
			id = labelsRS.fieldByName('label_id');
			text = labelsRS.fieldByName('text');
			
			label = new Label(id, issueID, text);
			label.text2 = labelsRS.fieldByName('text2');
			label.local = labelsRS.fieldByName('local');
			label.project_id = projectID;
			
			labels[i++] = label;
			labelsRS.next();
		}		
		labelsRS.close();
		return labels;
	},
	getDistinctLabels: function(params) {
		var labelsRS = null;
		if ('project_id' in params) {			
			var project_id = parseInt(params["project_id"]);
			labelsRS = this.db.execute(
				"SELECT label_id,text,text2,local,issue_id FROM Label WHERE issue_id " +
				"IN (SELECT issue_id FROM Issue WHERE project_id = ?)", project_id);
		} else {
			Titanium.API.error("Zatim nelze labely filtrovat jinak nez podle project_id");
			return new Array();
		}
		var labels = new Array(), i = 0, id, text, label, issue_id;
		while (labelsRS.isValidRow()) {
			label_id = labelsRS.fieldByName('label_id');
			text = labelsRS.fieldByName('text');
			issue_id = labelsRS.fieldByName('issue_id');
			
			label = new Label(label_id, issue_id, text);
			label.text2 = labelsRS.fieldByName('text2');
			label.local = labelsRS.fieldByName('local');
			
			labels[i++] = label;
			labelsRS.next();
		}		
		labelsRS.close();
		return labels;
	},
	getMilestones: function(params) {
		var milestoneRS = null, milestones = new Array(), title, date, project_id, id;
		if ('project_id' in params) {			
			var project_id = parseInt(params["project_id"]);
			milestoneRS = this.db.execute("SELECT milestone_id,date,title,id FROM Milestone WHERE project_id = ?", project_id);
		} else {
			Titanium.API.error("Milestones nelze ziskat jinak nez podle project_id");
			return null;
		}
		var i = 0;
		while (milestoneRS.isValidRow()) {
			id = milestoneRS.fieldByName('id');
			title = milestoneRS.fieldByName('title');
			date = milestoneRS.fieldByName('date');
			milestone_id = milestoneRS.fieldByName('milestone_id');
			
			milestone = new Milestone(id, title, date, project_id);
			milestone.milestone_id = milestone_id;					
			milestones[i++] = milestone;
			
			milestoneRS.next();
		}
		return milestones;
	},
	getMilestone: function(params) {
		var milestoneRS = null, milestone = null, title, date, project_id, id;
		if ('milestone_id' in params) {			
			var milestoneID = parseInt(params["milestone_id"]);
			milestoneRS = this.db.execute("SELECT project_id,date,title,id FROM Milestone WHERE milestone_id = ?", milestoneID);
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
	getUsers: function(params) {
		var rs = null, users = new Array(), user = null, name, email, id, user_id, project;
		if ('project_id' in params) {			
			var project_id = parseInt(params["project_id"]);
			rs = this.db.execute("SELECT user_id,name,email,id FROM User WHERE project_id = ?", project_id);
			project = this.getProject(this.getParamsObject("project_id", project_id));
		} else {
			Titanium.API.error("Users nelze ziskat jinak nez podle project_id");
			return null;
		}
		var i = 0;
		while (rs.isValidRow()) {
			name = rs.fieldByName('name');
			email = rs.fieldByName('email');
			id = rs.fieldByName('id');
			user_id = rs.fieldByName('user_id');			
			
			user = new User(name, email, project);
			user.user_id = user_id;
			user.id = id;
			users[i++] = user;
			
			rs.next();
		}
		return users;
	},
	getUser: function(params) {
		var rs = null, user = null, name, email, id, project_id, project;
		if ('user_id' in params) {			
			var user_id = parseInt(params["user_id"]);
			rs = this.db.execute("SELECT project_id,name,email,id FROM User WHERE user_id = ?", user_id);			
		} else {
			Titanium.API.error("User nelze ziskat jinak nez podle user_id");
			return null;
		}
		if (rs.rowCount() > 0) {
			project_id = rs.fieldByName("project_id");
			project = this.getProject(this.getParamsObject("project_id", project_id));		
			name = rs.fieldByName("name");
			email = rs.fieldByName("email");
			id = rs.fieldByName("id");
			
			user = new User(name, email, project);
			user.user_id = user_id;
			user.id = id;
		} else {
			user = new User("", "", null);
			user.user_id = 0;
			user.id = 0;
		}
		return user;
	},
	getAreas: function() {
		var rs = null, title = "", area_id = 0, areas = new Array(), i = 0, area = null;
		rs = this.db.execute("SELECT area_id,title FROM Area ORDER BY title ASC");
		while(rs.isValidRow()) {
			area_id = rs.fieldByName("area_id");
			title = rs.fieldByName("title");			
			areas[i++] = new Area(area_id, title);
			rs.next();
		}
		return areas;
	},
	getArea: function(params) {
		var rs = null, title = "", area = null;
		if ('area_id' in params) {			
			var area_id = parseInt(params["area_id"]);
			rs = this.db.execute("SELECT title FROM Area WHERE area_id = ?", area_id);			
		} else {
			Titanium.API.error("Area nelze ziskat jinak nez podle area_id");
			return null;
		}
		if (rs.rowCount() > 0) {
			title = rs.fieldByName("title");
			area = new Area(area_id, title);
		}
		return area;
	},
	getIssueCounts: function(projects) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null, counts = new Array(), results = null;
		projects.each(function(project) {
			results = new Array();
			rs = db.execute("SELECT count(issue_id) as pocet FROM Issue WHERE project_id = ?", project.project_id);
			results["all"] = rs.fieldByName("pocet");
			rs = db.execute("SELECT count(issue_id) as pocet FROM Issue WHERE state = 1 AND project_id = ?", project.project_id);
			results["completed"] = rs.fieldByName("pocet");
			rs = db.execute("SELECT min(dueDate) as minimum FROM Issue WHERE project_id = ?", project.project_id);
			results["due"] = rs.fieldByName("minimum");
			counts[project.project_id] = results;
		});
		return counts;
	},
	saveProject: function(project) {
		var app = Titanium.API.get("app");
		var model = Titanium.API.get("model");
		var db = app.db, project_id;
		if (project.project_id == 0) {
			db.execute("INSERT INTO project (name,description,type,state) VALUES (?,?,?,?)", 
						project.name, project.description, project.type, project.state);
			project.project_id = db.lastInsertRowId;
		} else {
			db.execute("UPDATE project SET name = ?, description = ?, state = ?, type = ? WHERE project_id = ?",
						project.name, project.description, project.state, project.type, project.project_id);
		}
		if (project.labels.length > 0)
			model.saveLabels(project.labels, 0, project.project_id);
		if (project.area != null) {
			var area_id = (project.area.area_id == 0) ? model.saveArea(project.area) : project.area.area_id;
			db.execute("UPDATE project SET area_id = ? WHERE project_id = ?", area_id, project.project_id);
		}
		return project.project_id;
	},
	saveIssue: function(issue) {
		var app = Titanium.API.get("app");
		var model = Titanium.API.get("model");
		var db = app.getDb();
		var milestoneID = null;
		if (issue.milestone != null) {
			milestoneID = model.saveMilestone(issue.milestone, issue.project.project_id);
		}
		if (issue.user == null) {
			issue.user = new User("", "", null);
			issue.user.user_id = 0;
		}
		if (issue.issue_id != 0) {
			db.execute(
				'UPDATE Issue SET id = ?, title = ?, description = ?, status = ?, project_id = ?, milestone_id = ?, inbox = ?, user_id = ?, dueDate = ?, state = ? WHERE issue_id = ?'
				, issue.id, issue.title, issue.description, issue.status, issue.project.project_id, milestoneID, issue.inbox, issue.user.user_id, issue.dueDate, issue.state, issue.issue_id);
		} else {			
			db.execute(
				'INSERT INTO Issue (id, title, description, state, status, project_type, project_id, milestone_id, inbox, user_id, dueDate) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
				, issue.id, issue.title, issue.description, issue.state, issue.status, issue.project.type, issue.project.project_id, milestoneID, issue.inbox, issue.user.user_id, issue.dueDate);
			issue.issue_id = db.lastInsertRowId;
		}		
		if (issue.labels.length != 0) {
			model.saveLabels(issue.labels, issue.issue_id, 0);
		}
		return issue.issue_id;
	},
	saveIssueNumber: function(issue) {
		if (issue.issue_id != 0) {
			var app = Titanium.API.get("app");
			var db = app.getDb();
			db.execute("UPDATE Issue SET id = ? WHERE issue_id = ?", issue.id, issue.issue_id);
		}
	},
	saveLabels: function(labels, issue_id, project_id) {
		var app = Titanium.API.get("app");		
		var db = app.getDb();
		var rs = null;
		labels.each(function(label) {
			if (issue_id != 0) {
				rs = db.execute("SELECT label_id FROM Label WHERE issue_id = ? AND text = ?", issue_id, label.text);
			} else {
				rs = db.execute("SELECT label_id FROM Label WHERE project_id = ? AND text = ?", project_id, label.text);
			}
			if (rs.rowCount() == 0) {
				db.execute("INSERT INTO Label (text,text2,issue_id,local,project_id) VALUES (?,?,?,?,?)", label.text, label.text2, issue_id, label.local, project_id);
			}
		});
	},
	saveMilestone: function(milestone, project_id) {
		var app = Titanium.API.get("app");		
		var db = app.getDb();
		if (milestone.project_id != 0)
			project_id = milestone.project_id;
		var rs = db.execute("SELECT milestone_id FROM Milestone WHERE title = ? AND project_id = ? LIMIT 1"
			, milestone.title, project_id);
		var milestone_id = 0;
		if (rs.rowCount() == 0) {
			db.execute("INSERT INTO Milestone (id,title,date,project_id) VALUES (?,?,?,?)"
				, milestone.id, milestone.title, milestone.date, project_id);
			milestone_id = db.lastInsertRowId;
		} else {
			milestone_id = rs.fieldByName("milestone_id");
		}
		return milestone_id;
	},
	saveUser: function(user, project_id) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		if (user.project != null && user.project.project_id != 0)
			project_id = user.project.project_id;
		var rs = null, user_id = 0;
		rs = db.execute("SELECT user_id FROM User WHERE name = ? AND project_id = ?", user.name, project_id);
		if (rs.rowCount() > 0) {
			user_id = rs.fieldByName("user_id");
			db.execute("UPDATE User SET name = ?, email = ?, id = ? WHERE user_id = ?", 
						user.name, user.email, user.id, userID);
		} else {
			db.execute("INSERT INTO User (name,email,id,project_id) VALUES (?,?,?,?)",
						user.name, user.email, user.id, project_id);
			user_id = db.lastInsertRowId;
		}
		return user_id;
	},
	saveArea: function(area) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null, area_id = 0;
		rs = db.execute("SELECT area_id FROM Area WHERE title = ?", area.title);
		if (rs.rowCount() == 0) {
			db.execute("INSERT INTO Area (title) VALUES (?)", area.title);
			area_id = db.lastInsertRowId;
		} else {
			area_id = rs.fieldByName("area_id");
		}
		return area_id;
	},
	archiveIssue: function(issue_id) {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		db.execute("UPDATE Issue SET archived = 1 WHERE issue_id = ?", issue_id);
	},
	moveToTrash: function(issue_id) {
		var app = Titanium.API.get("app");
		var db = app.getDb(), rs = null;
		rs = db.execute("SELECT title,description,state,status FROM Issue WHERE issue_id = ?", issue_id);
		if (rs.rowCount() > 0) {
			db.execute(
				"INSERT INTO Trash (issue_id,title,description,state,status) VALUES (?,?,?,?,?)",
				issue_id, rs.fieldByName("title"), rs.fieldByName("description"), rs.fieldByName("state"), rs.fieldByName("status")
			);
			db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
		}
	},
	emptyTrash: function() {
		var app = Titanium.API.get("app");
		var db = app.getDb();
		db.execute("DELETE FROM Trash");
	}
});