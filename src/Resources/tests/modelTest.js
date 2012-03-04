/**
 * @author saterond
 */
var configFile = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json');

if (!configFile.exists()) 
	console.log("Config file's missing!");
var config = Titanium.JSON.parse(configFile.read());
var db = Titanium.Database.open(config.database);
var model = new GTDModel(db);

var DataTestSuite = {
    suiteName: "Data Test Suite",       
    
    setUp: function() {
    },
 
    tearDown: function() {
    },
 
    testGetProjects: function() {
 		var all = db.execute("SELECT count(project_id) as pocet FROM project");
 		var db_count = all.fieldByName("pocet");
 		var projects = model.getProjects();
 		var mo_count = projects.length;
 		jsUnity.assertions.assertEqual(db_count, mo_count, "Model have found different count of projects");
    },
    
    testGetProject: function() {
    	var one = db.execute("SELECT project_id,name FROM project LIMIT 1");
    	var project_id = one.fieldByName("project_id");
    	var project_name = one.fieldByName("name");
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getProject(params);
    	
    	jsUnity.assertions.assertEqual(project_name, mo_one.name, "Project names doesn't match");
    	db.close();
    }
};
