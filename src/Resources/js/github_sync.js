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
	},
	closeIssue: function(issue_id) {
		Titanium.API.info("enter");
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
			rs = db.execute('SELECT issue_id FROM Issue WHERE gh_id = ?', id);
			if (rs.rowCount() == 0) {							
				db.execute('INSERT INTO Issue (project_name,user_id,title,gh_id) VALUES (?,?,?,?)', repo, 1, title, id);
			}
		});
		var viewer = Titanium.API.get("viewer");
		viewer.reloadIssues(repo);
	},
	saveIssueToDatabase: function(json, issue_id) {
		Titanim.API.info("Issue nr. " + issue_id);
	}
});
