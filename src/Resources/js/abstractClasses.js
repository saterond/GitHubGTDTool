/**
 * Abstraktni trida pro vsechna API
 * 
 * @author Ondrej Satera
 */
var API = Class.create({
	initialize: function() {},
	getProjects: function() {},
	getIssues: function(project) {},
	getUsers: function(project) {},
	getLabels: function(issue) {},
	addProject: function(project) {},
	addIssue: function(issue) {},
	editProject: function(project) {},
	editIssue: function(issue) {},
	deleteIssue: function(issue) {}
});
