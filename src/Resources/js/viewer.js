var GTDViewer = Class.create({	
	db: null,	
	initialize: function(database) {
		this.db = database;
	},
	showMessage: function(message) {
		alert(message);
	},
	getFileContent: function(filename) {		
		var resourceDir = Titanium.Filesystem.getResourcesDirectory();	
	    var file = Titanium.Filesystem.getFile(resourceDir, filename);
	    var stream = Titanium.Filesystem.getFileStream(file);
	    var content = file.read();
	    stream.close();
	    return content.toString();
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
			content += '<li class="project" data-key="'+projectName+'*'+projectType+'*'+projectId+'">' + projectName + ' (' + projectType + ')</li>';
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
		var issuesRS = this.db.execute("SELECT issue_id,title,description FROM Issue WHERE project_id = ?", projectID);		
		var issue = "", content = "", type = "";
		var template = this.getFileContent("templates/issue.tpl");
		while (issuesRS.isValidRow()) {			
			var id = issuesRS.fieldByName('issue_id');
			var title = issuesRS.fieldByName('title');
			var description = issuesRS.fieldByName('description');
			issue = template;
			issue = issue.replace(/{issue_id}/g, id);
			issue = issue.replace("{title}", title);
			issue = issue.replace("{description-short}", description.substr(0, 100));
			issue = issue.replace("{description-full}", description);
			content += issue;
			issuesRS.next();
		}
		issuesRS.close();
		
		var sync = Titanium.API.get("sync");
		var project = sync.getProject(projectID);
		switch(project.type) {
			case 1: type = "assembla"; break;
			case 2: type = "gcode"; break;
			case 3: type = "github"; break;
		}
		
		jQuery.noConflict();
		var syncButton = '<button id="syncIssues" data-key="'+project.name+'*'+project.type+'*'+projectID+'">sync</button>';
		jQuery("div.projectButtons").html(syncButton);
		jQuery("div.projectHeader h2").removeClass().addClass(type);
		jQuery("div.projectHeader h2").html(project.name);
		jQuery("div#issues").empty();
		jQuery("div#issues").html(content);
	}
});
