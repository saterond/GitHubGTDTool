var GTDViewer = Class.create({	
	db: null,	
	initialize: function(database) {
		this.db = database;
	},
	reloadProjects: function() {		
		var projectsRS = this.db.execute("SELECT * FROM Project");		
		var content = "";		
		var projects = [];
		var i = 0;
		while (projectsRS.isValidRow()) {			
			var projectId = projectsRS.fieldByName('project_id');
			var projectName = projectsRS.fieldByName('name');
			content += "<li class=\"project\">" + projectName + " - ";
			content += '<button id="loadIssues" data-key="'+projectName+'">load issues</button>';
			content += '<button id="syncIssues" data-key="'+projectName+'">sync issues</button>';			
			content += '</li>';
			projects[i] = projectName;
			projectsRS.next();
			i += 1;
		}
		projectsRS.close();
		jQuery.noConflict();
		
		jQuery("ul#projects").empty();
		jQuery("ul#issues").empty();
		jQuery("ul#projects").html(content);
		
		Titanium.API.set("projects", projects);
	},
	reloadIssues: function(repo) {		
		var issuesRS = this.db.execute("SELECT * FROM Issue WHERE project_name = ?", repo);		
		var content = "";		
		while (issuesRS.isValidRow()) {			
			var title = issuesRS.fieldByName('title');
			var id = issuesRS.fieldByName('issue_id');
			content += "<li class=\"issue\">" + title + " - ";
			if (issuesRS.fieldByName('closed')) {
				content += 'closed';
			} else {
				content += '<button id="closeIssue" data-key="' + id + '">close issue</button>';
			}
			content += '</li>';		
			issuesRS.next();
		}
		issuesRS.close();
		jQuery.noConflict();
				
		jQuery("ul#issues").empty();
		jQuery("ul#issues").html(content);
	}
});
