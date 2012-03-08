var GTDViewer = Class.create({	
	db: null,	
	model: null,
	initialize: function(database, model) {
		this.db = database;
		this.model = model;
	},
	showMessage: function(message) {
		Titanium.API.error("CHYBA v aplikaci: " + message);
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
	isProjectActive: function(project_id) {
		var active = Titanium.API.get("active");
		if (active != "") {
			var parts = active.split("*");
			if (parts[0] == "project" || parts[0] == "inbox") {
				return (parts[2] == project_id);
			}
			return false;
		}
		return false;
	},
	reloadProjects: function() {
		$("loader").removeClassName("hidden");
		var projects_db = this.model.getProjects();
		var i = 0, html = new Array(), li = null, key = "", projects = new Array();
		projects_db.each(function(project) {
			key = project.name+'*'+project.type+'*'+project.project_id;
			li = new Element("li", {"class" : "project", "data-key" : key}).update(project.name);
			li.on("click", handleSelectProject);
			projects[i++] = project;
			html[i++] = li;
		});
			
		$("projects").update();
		html.each(function(li) {
			$("projects").insert({
				bottom : li
			});
		});		
		$("loader").addClassName("hidden");
		
		Titanium.API.set("projects", projects);
	},
	generateIssueList: function(issues) {
		var issue = "", content = "", type = "", labels, cssClass, milestonePercent = 0;
		var template = this.getFileContent("templates/issue.tpl");		
		issues.each(function(issuee) {			
			issue = template;
			issue = issue.replace(/{issue_id}/g, issuee.issue_id);
			issue = issue.replace("{title}", issuee.title);
			if (issuee.description != null) {
				issue = issue.replace("{description-short}", issuee.description.substr(0, 100));
			} else {
				issue = issue.replace("{description-short}", "");
			}			
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
				milestonePercent = Titanium.API.get("model").getMilestonePercent(Titanium.API.get("model").getParamsObject("milestone_id", issuee.milestone.milestone_id));
			} else {
				milestonePercent = 0;
			}
			issue = issue.replace(/{milestone-percent}/g, milestonePercent);
			issue = issue.replace("{commits}", '');
			
			/*var editButton = new Element("button", {"class":"cupid-green", "data-key":issuee.issue_id, "id":"editIssue"}).update("Edit issue");
			editButton.on("click", handleShowEditIssueDialog);
			issue = issue.replace("{editButton}", editButton);*/
			
			cssClass = "";
			labels = "";
			if (issuee.labels != null) {
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
			}
			issue = issue.replace("{labels}", labels);			
			content += issue;						
		});
		return content;
	},
	reloadIssues: function(projectID) {
		var issues = this.model.getIssues(this.getParamsObject("project_id", projectID));
		var project = this.model.getProject(this.getParamsObject("project_id", projectID));
		var labels = this.model.getDistinctLabels(this.getParamsObject("project_id", projectID));
		var project_labels = this.model.getLabels(this.getParamsObject("project_id", projectID));
		var content = this.generateIssueList(issues);
		
		var type = "general";
		switch(project.type) {
			case 1: type = "assembla"; break;
			case 2: type = "gcode"; break;
			case 3: type = "github"; break;
		}
				
		var key = project.name+'*'+project.type+'*'+projectID;
		var syncButton = new Element("button", {"id" : "syncIssues", "data-key" : key}).update("Sync issues");
		syncButton.on("click", handleSyncIssues);
		$$("div.projectButtons").each(function(e) {
			e.update(syncButton);
		});
		if (project_labels.length > 0) {
			var labels_wrapper = new Element("div", {"class" : "labels project-labels"});
			var label_span = null;
			project_labels.each(function(label) {
				label_span = new Element("span", {"class" : "label", "data-key" : label.label_id}).update(label.text);
				label_span.on("click", handleSelectLabel);
				labels_wrapper.insert({
					top : label_span
				});
			});
			$$("div.projectButtons").first().insert({
				bottom : labels_wrapper
			});
		}
		key = 'project*'+project.type+'*'+projectID;
		Titanium.API.set("active", key);
		
		$$("div.projectHeader h2").each(function(e) {
			e.removeClassName('assembla');
			e.removeClassName('gcode');
			e.removeClassName('github');
			e.addClassName(type);
		});
		if (project.area != null) {
			$$("div.projectHeader h2").each(function(e) {
				e.update(project.name + " [" + project.area.title + "]");
			});
		} else {
			$$("div.projectHeader h2").each(function(e) {
				e.update(project.name);
			});
		}
		$("issues").update("");
		$("issues").update(content);
		$("editProjectButton").writeAttribute("data-key", projectID);
		if (labels.length > 0) {
			var wrapper = new Element("div", {"class" : "labels"});
			var span = null;			
			labels.each(function(label) {
				span = new Element("span", {"class" : "label", "data-key" : label.label_id}).update(label.text);
				span.on("click", handleSelectLabel);
				wrapper.insert({
					top : span
				});
			});
			$$("div.projectButtons").first().insert({
				bottom : wrapper
			});
		}		
	},
	loadSelection: function(params) {
		var task = 0, selector = "";
		if ('selection' in params) {			
			task = parseInt(params["selection"]);
		} else if ('label' in params) {
			task = 10;
			selector = parseInt(params["label"]);
		}
		var viewer = Titanium.API.get("viewer");
		var issues = null, content = "", name = "", labels = new Array(), key = "";
		switch(task) {
			case 1:
				name = "Inbox";
				key = "inbox*0*1";
				issues = viewer.model.getIssues(viewer.getParamsObject("inbox", 1));
				labels = viewer.model.getDistinctLabels(viewer.getParamsObject("project_id", 0));
				content = viewer.generateIssueList(issues);
				break;
			case 2:
				name = "Day review";
				key = "review*0*2";
				break;
			case 3:
				name = "Week review";
				key = "review*0*3";
				break;
			case 4: 
				name = "Month review";
				key = "review*0*4";
				break;
			case 5:
				name = "Today";
				key = "today*0*5";
				issues = viewer.model.getIssues(viewer.getParamsObject("today", 1));
				content = viewer.generateIssueList(issues);
				break;
			case 6:
				name = "Tasks scheduled for later";
				key = "scheduled*0*6";
				issues = viewer.model.getIssues(viewer.getParamsObject("scheduled", 1));
				content = viewer.generateIssueList(issues);
				break;
			case 7:
				name = "Global project overview";
				key = "global*0*7";
				issues = new Array();
				content = viewer.generateIssueList(issues);
				break;
			case 8:
				name = "Archived issues";
				key = "archived*0*8";
				issues = viewer.model.getIssues(viewer.getParamsObject("archived", 1));
				content = viewer.generateIssueList(issues);
				break;
			case 9:
				name = "Trashed issues";
				key = "trash*0*8";
				issues = viewer.model.getTrashedIssues();
				content = viewer.generateIssueList(issues);
				break;
			case 10:
				name = "Label based selection";
				key = "label*0*" + selector;
				issues = viewer.model.getIssues(viewer.getParamsObject("label", selector));
				content = viewer.generateIssueList(issues);
				break;
			default:
				name = "Unknown selection";
				break;
		}
				
		Titanium.API.set("active", key);
		
		if (labels.length > 0) {
			$$("div.projectButtons").first().update();
			var wrapper = new Element("div", {"class" : "labels"});
			var span = null;
			labels.each(function(label) {
				span = new Element("span", {"class" : "label", "data-key" : label.label_id}).update(label.text);
				span.on("click", handleSelectLabel);
				wrapper.insert({
					top : span
				});
			});
			$$("div.projectButtons").first().update(wrapper);
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
		$("editProjectButton").writeAttribute("data-key", 0);
	}
});
