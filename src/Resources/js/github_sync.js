jQuery.noConflict();

var GitHubSync = Class.create({
	config: [],
	db: null,
	initialize: function(config, database) {
		this.config = config;
		this.db = database;
	},
	syncRepositories: function() {		
		var username = this.config.username;		
				
		GitHubAPI.Repos(username, this.saveReposToDatabase);				
	},
	syncIssues: function(repo) {
		var username = this.config.username;

		GitHubAPI.Issues(username, repo, this.saveIssuesToDatabase);
		GitHubAPI.IssuesClosed(username, repo, this.saveIssuesToDatabase);
	},
	closeIssue: function(issue_id) {
		rs = this.db.execute('SELECT gh_id,project_name FROM Issue WHERE issue_id = ?', issue_id);
		if (rs.rowCount() == 1) {
			username = this.config.username;
			auth = this.config.auth;
			gh_id = rs.fieldByName("gh_id");
			repo = rs.fieldByName("project_name");
			this.db.execute("UPDATE Issue SET closed = 1 WHERE issue_id = ?", issue_id);
			GitHubAPI.CloseIssue(auth, username, repo, gh_id, this.closeIssueInDatabase);			
		} else {
			Titanium.API.info("Issue not found")
		}
	},
	saveIssue: function(id, title, project_name) {		
		if (id != 0) {
			//TODO editovani issues
		} else {			
			username = this.config.username;
			auth = this.config.auth;			
			
			GitHubAPI.SaveNewIssue(auth, username, project_name, title, this.saveNewIssueToDatabase);			
		}
		
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(project_name);
	},
	saveReposToDatabase: function(json) {		
		//ztracime kontext objektu, musime ziskat databazi rucne		
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null;						
		json.data.each(function(repo) {
			projectName = repo.name;
			rs = db.execute('SELECT project_id FROM project WHERE gh_name = ?', projectName);
			if (rs.rowCount() == 0) {
				db.execute('INSERT INTO project (name,gh_name) VALUES (?,?)', projectName, projectName);
			}
		});		
	},
	saveIssuesToDatabase: function(json, repo) {		
		//ztracime kontext objektu, musime ziskat databazi rucne		
		var app = Titanium.API.get("app");
		var db = app.getDb();
		var rs = null;
		json.data.each(function(issue) {
			title = issue.title;
			id = issue.number;
			state = issue.state;
			rs = db.execute('SELECT issue_id FROM Issue WHERE gh_id = ?', id);
			if (state == 'closed') {
				state = 1;
			} else {
				state = 0;
			}
			if (rs.rowCount() == 0) {				
				db.execute('INSERT INTO Issue (project_name,user_id,title,gh_id,closed) VALUES (?,?,?,?,?)', repo, 1, title, id, state);
			} else {				
				db.execute('UPDATE Issue SET closed = ? WHERE gh_id = ?', state, id);				
			}
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(repo);
	},
	saveNewIssueToDatabase: function(repo, response) {		
		var app = Titanium.API.get("app");
		var db = app.getDb();
		json = Titanium.JSON.parse(response);
		title = json.title;
		number = json.number;
		db.execute("INSERT INTO Issue (title, user_id, project_name, gh_id) VALUES (?,?,?)", title, 1, repo, number);
	},
	closeIssueInDatabase: function(repo, json) {		
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(repo);
	}
});
