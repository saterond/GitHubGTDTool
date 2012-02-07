var GTDViewer = Class.create({	
	db: null,	
	initialize: function(database) {
		this.db = database;
	},
	showMessage: function(message) {
		Titanium.API.info(message);
	},
	reloadProjects: function() {		
		var projectsRS = this.db.execute("SELECT * FROM Project");		
		var content = "";		
		var projects = [];
		var i = 0;
		while (projectsRS.isValidRow()) {			
			var projectId = projectsRS.fieldByName('project_id');
			var projectName = projectsRS.fieldByName('name');
			var projectType = projectsRS.fieldByName('type');
			content += "<li class=\"project\">" + projectName + " (" + projectType + ")<br>";
			content += '<button id="loadIssues" data-key="'+projectName+'*'+projectType+'*'+projectId+'">load issues</button>';
			content += '<button id="syncIssues" data-key="'+projectName+'*'+projectType+'*'+projectId+'">sync issues</button>';			
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
	reloadIssues: function(projectID) {
		Titanium.API.info("selecting issues from project #" + projectID);
		var issuesRS = this.db.execute("SELECT issue_id,title FROM Issue WHERE project_id = ?", projectID);		
		var content = "";
		while (issuesRS.isValidRow()) {			
			var id = issuesRS.fieldByName('issue_id');
			var title = issuesRS.fieldByName('title');			
			content += "<li class=\"issue\">" + title + " - ";
			content += '<button id="closeIssue" data-key="' + id + '">close issue</button>';			
			content += '</li>';		
			issuesRS.next();
		}
		issuesRS.close();
		jQuery.noConflict();
				
		jQuery("ul#issues").empty();
		jQuery("ul#issues").html(content);
	}
});
