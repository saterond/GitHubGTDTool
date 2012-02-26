var GTDViewer = Class.create({	
	db: null,	
	model: null,
	initialize: function(database, model) {
		this.db = database;
		this.model = model;
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
	getParamsObject: function(key, value) {
		var obj = new Object();
		obj[key] = value;
		return obj;
	},
	reloadProjects: function() {		
		var projects = this.model.getProjects();
		var content = "", i = 0;
		projects.each(function(project) {			
			content += '<li class="project" data-key="'+project.name+'*'+project.type+'*'+project.project_id+'">' + project.name + '</li>';
			projects[i++] = project;
		});
						
		$("issues").update("");
		$("projects").update(content);
		
		Titanium.API.set("projects", projects);
	},
	generateIssueList: function(issues) {
		var viewer = Titanium.API.get("viewer");
		var issue = "", content = "", type = "", labels, cssClass, milestonePercent = 0;
		var template = viewer.getFileContent("templates/issue.tpl");		
		issues.each(function(issuee) {			
			issue = template;
			issue = issue.replace(/{issue_id}/g, issuee.id);
			issue = issue.replace("{title}", issuee.title);
			issue = issue.replace("{description-short}", issuee.description.substr(0, 100));
			issue = issue.replace("{description-full}", issuee.description);
			if (issuee.state) {
				issue = issue.replace("{state-active}", ' checked="checked"');
				issue = issue.replace("{state-completed}", '');
			} else {
				issue = issue.replace("{state-active}", '');
				issue = issue.replace("{state-completed}", ' checked="checked"');
			}
			issue = issue.replace("{coworkers}", '');			
			if (issuee.milestone != null) {				
				milestonePercent = Titanium.API.get("viewer").model.getMilestonePercent(Titanium.API.get("viewer").getParamsObject("milestone_id", issuee.milestone.milestone_id));
			} else {
				milestonePercent = 0;
			}
			issue = issue.replace(/{milestone-percent}/g, milestonePercent);
			issue = issue.replace("{commits}", '');
			
			cssClass = "";
			labels = "";
			issuee.labels.each(function(label) {
				cssClass = "label";
				if (!label.local) {
					cssClass = "label global";
				}
				if (label.text2 != "") {
					labels += '<span class="' + cssClass + '">' + label.text + ':' + label.text2 + '</span>';
				} else {
					labels += '<span class="' + cssClass + '">' + label.text + '</span>';
				}
			});			
			issue = issue.replace("{labels}", labels);
			
			content += issue;						
		});		
		return content;
	},
	reloadIssues: function(projectID) {
		$("loader").show();
		var issues = this.model.getIssues(this.getParamsObject("project_id", projectID));
		var project = this.model.getProject(this.getParamsObject("project_id", projectID));
		
		var content = this.generateIssueList(issues);
		
		switch(project.type) {
			case 1: type = "assembla"; break;
			case 2: type = "gcode"; break;
			case 3: type = "github"; break;
		}				
				
		var syncButton = '<button id="syncIssues" data-key="'+project.name+'*'+project.type+'*'+projectID+'">Sync issues</button>';
		$$("div.projectButtons").each(function(e) {
			e.update(syncButton);
		});
		$$("div.projectHeader h2").each(function(e) {
			e.removeClassName('assembla');
			e.removeClassName('gcode');
			e.removeClassName('github');
			e.addClassName(type);
		});
		$$("div.projectHeader h2").each(function(e) {
			e.update(project.name);
		});
		$("issues").update("");
		$("issues").update(content);
		
		$("loader").hide();
	},
	loadSelection: function(key) {
		var viewer = Titanium.API.get("viewer");
		var issues = null, content = "", name = "";
		switch(key) {
			case 1:
				issues = viewer.model.getIssues(viewer.getParamsObject("inbox", 1));
				console.log("done loading issues");
				content = viewer.generateIssueList(issues);
				name = "Inbox";
				break;
			case 2:
				name = "Day review";
				break;
			case 3:
				name = "Week review";
				break;
			case 4: 
				name = "Month review";
				break;
			default:
				name = "Unknown selection";
				break;
		}
		
		$$("div.projectHeader h2").each(function(e) {
			e.removeClassName('assembla');
			e.removeClassName('gcode');
			e.removeClassName('github');			
		});
		$$("div.projectHeader h2").each(function(e) {
			e.update(name);
		});
		$("issues").update("");
		$("issues").update(content);		
	}
});
