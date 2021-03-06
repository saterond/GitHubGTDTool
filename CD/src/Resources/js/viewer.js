var GTDViewer = Class.create({	
	db: null,	
	model: null,
	initialize: function(database, model) {
		this.db = database;
		this.model = model;
	},
	showMessage: function(message) {
		Titanium.API.error("Notification: " + message);
		$("notifications").update(message);
		new Effect.Notify('notifications');
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
		
		Titanium.API.set("projects", projects);
	},
	generateIssueList: function(issues, showProjectName) {
		if (showProjectName == undefined) {
			showProjectName = true;
		}
		var issue = "", content = "", type = "", labels, cssClass, milestonePercent = 0;
		var template = this.getFileContent("templates/issue.tpl");		
		issues.each(function(issuee) {			
			issue = template;
			issue = issue.replace(/{issue_id}/g, issuee.issue_id);
			if (showProjectName && issuee.project != null) {
				issue = issue.replace("{title}", issuee.project.name + " / " + issuee.title);
			} else {
				issue = issue.replace("{title}", issuee.title);
			}
			if (issuee.description != null) {
				issue = issue.replace("{description-short}", issuee.description.substr(0, 100));
			} else {
				issue = issue.replace("{description-short}", "");
			}			
			issue = issue.replace("{description-full}", issuee.description);
			if (issuee.state) {
				issue = issue.replace("{state-active}", ' checked="checked"');
				issue = issue.replace("{state-completed}", '');
				issue = issue.replace("{state}", 'open');
			} else {
				issue = issue.replace("{state-active}", '');
				issue = issue.replace("{state-completed}", ' checked="checked"');
				issue = issue.replace("{state}", 'closed');
			}
			if (issuee.user != null) {
				issue = issue.replace("{assigned}", issuee.user.name);
			} else {
				issue = issue.replace("{assigned}", 'none');
			}			
			if (issuee.milestone != null) {
				milestonePercent = Titanium.API.get("model").getMilestonePercent(Titanium.API.get("model").getParamsObject("milestone_id", issuee.milestone.milestone_id));
			} else {
				milestonePercent = 0;
			}
			issue = issue.replace(/{milestone-percent}/g, milestonePercent);
			issue = issue.replace("{commits}", '');
			
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
	generateProjectList: function(projects, counts) {
		var project = "", content = "", type = "", labels, cssClass, temp;
		var template = this.getFileContent("templates/project.tpl");
		projects.each(function(project) {			
			temp = template;
			temp = temp.replace(/{project_id}/g, project.project_id);
			temp = temp.replace("{title}", project.name);
			if (project.area != null) {
				temp = temp.replace("{area}", " [" + project.area.title + "]");
			} else {
				temp = temp.replace("{area}", "");
			}
			
			temp = temp.replace("{description}", project.description);
			
			cssClass = "";
			labels = "";
			if (project.labels != null) {
				project.labels.each(function(label) {
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
			temp = temp.replace("{labels}", labels);
			
			temp = temp.replace("{issue_count}", counts[project.project_id]["all"]);
			temp = temp.replace("{issue_completed}", counts[project.project_id]["completed"]);
			temp = temp.replace("{issue_due}", counts[project.project_id]["due"]);						
						
			content += temp;
		});
		return content;
	},
	reloadIssues: function(projectID) {
		var issues = this.model.getIssues(this.getParamsObject("project_id", projectID));
		var project = this.model.getProject(this.getParamsObject("project_id", projectID));
		var labels = this.model.getDistinctLabels(this.getParamsObject("project_id", projectID));
		var project_labels = this.model.getLabels(this.getParamsObject("project_id", projectID));
		var content = this.generateIssueList(issues, false);
		
		var type = "general";
		switch(project.type) {
			case 1: type = "assembla"; break;
			case 2: type = "gcode"; break;
			case 3: type = "github"; break;
		}
				
		var key = project.name+'*'+project.type+'*'+projectID;
		if (project.type != 0) {
			var syncButton = new Element("button", {"id" : "syncIssues", "data-key" : key, "class" : "cupid-blue"}).update("Sync issues");
			syncButton.on("click", handleSyncIssues);
			$$("div.projectButtons").each(function(e) {
				e.update(syncButton);
			});
		} else {
			$$("div.projectButtons").each(function(e) {
				e.update();
			});
		}
		if (project_labels.length > 0) {
			var labels_wrapper = new Element("div", {"class" : "labels project-labels"});
			var label_span = null;
			project_labels.each(function(label) {
				label_span = new Element("span", {"class" : "label", "data-key" : label.label_id}).update(label.text);
				label_span.on("click", handleSelectProjectLabel);
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
		
		Sortable.create('issues' , {
			tag: 'div',
			onUpdate: function() {
				var data = Sortable.sequence('issues');
				handleChangeIssueOrder(data);
			}
		});
	},
	loadSelection: function(params) {
		var task = 0, selector = "";
		if ('selection' in params) {			
			task = parseInt(params["selection"]);
		} else if ('label' in params) {
			task = 10;
			selector = params["label"];
		} else if ('plabel' in params) {
			task = 11;
			selector = params["plabel"];
		}
		var viewer = Titanium.API.get("viewer");
		var issues = null, projects = null, content = "", name = "", labels = new Array(), key = "";
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
				issues = viewer.model.getIssues(viewer.getParamsObject("review", 0));
				content = viewer.generateIssueList(issues);
				break;
			case 3:
				name = "Week review";
				key = "review*0*3";
				issues = viewer.model.getIssues(viewer.getParamsObject("review", 7));
				content = viewer.generateIssueList(issues);
				break;
			case 4: 
				name = "Month review";
				key = "review*0*4";
				issues = viewer.model.getIssues(viewer.getParamsObject("review", 30));
				content = viewer.generateIssueList(issues);
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
				projects = viewer.model.getProjects();
				var issue_counts = viewer.model.getIssueCounts(projects);
				content = viewer.generateProjectList(projects, issue_counts);
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
			case 11:
				name = "Project label based selection";
				key = "label*0*" + selector;
				projects = viewer.model.getProjects(viewer.getParamsObject("plabel", selector));
				var issue_counts = viewer.model.getIssueCounts(projects);
				content = viewer.generateProjectList(projects, issue_counts);
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
		
		if (projects != null && projects.length > 0) {
			var chart = null, userImpact = null;
			projects.each(function(project) {
				userImpact = viewer.model.getUserImpact(project.project_id);
				chart = new Highcharts.Chart({
					chart: {renderTo: 'container_' + project.project_id},
					title: {text: 'User Impact'},
					tooltip: {formatter: function() {return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';}},
					series: [{
						type: 'pie',
						name: 'User Impact',
						data: userImpact
					}]
				});
			});
		}
		
		$("editProjectButton").writeAttribute("data-key", 0);
	}
});
