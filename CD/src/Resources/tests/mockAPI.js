/**
 * @author saterond
 */
var MockAPI = Class.create(API, {
	name: "",
	initialize: function(_name) {
		this.name = _name;
	},
	
	getProjects: function(callback) {
		var projects = new Array();
		Titanium.API.info("API "+this.name+" - getProjects");
		callback(projects);
	},
	getIssues: function(project, callback) {console.log("Method not implemented");},
	getUsers: function(project, callback) {console.log("Method not implemented");},
	getLabels: function(issue, callback) {console.log("Method not implemented");},
	getMilestones: function(issue, callback) {console.log("Method not implemented");},
	
	addProject: function(project, callback) {console.log("Method not implemented");},
	addIssue: function(issue, callback) {console.log("Method not implemented");},
	addMilestone: function(issue, callback) {console.log("Method not implemented");},
	
	editProject: function(project, callback) {console.log("Method not implemented");},
	editIssue: function(issue, callback) {console.log("Method not implemented");},
	editMilestone: function(issue, callback) {console.log("Method not implemented");},
	
	deleteIssue: function(issue, callback) {console.log("Method not implemented");},
	deleteProject: function(issue, callback) {console.log("Method not implemented");},
	deleteMilestone: function(issue, callback) {console.log("Method not implemented");}
});