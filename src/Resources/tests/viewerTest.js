/**
 * @author saterond
 */
var configFile = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json');

if (!configFile.exists()) 
	console.log("Config file's missing!");
var config = Titanium.JSON.parse(configFile.read());
var db = Titanium.Database.open(config.database);
var model = new GTDModel(db);
var viewer = new GTDViewer(db, model);

var ViewerTestSuite = {
    suiteName: "Viewer Test Suite",
    
    setUp: function() {
    },
 
    tearDown: function() {
    },
 
    testGenerateIssueList: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	var issue = new Issue(0, "testxx000", "testxx000");
    	db.execute("INSERT INTO Issue (title,description,project_id) VALUES (?,?,?)", issue.title, issue.description, project_id);
    	var issue2 = new Issue(0, "testxx0002", "testxx0002");
    	db.execute("INSERT INTO Issue (title,description,project_id) VALUES (?,?,?)", issue2.title, issue2.description, project_id);    	
    	
    	var issues = new Array();
    	issues[1] = issue;
    	issues[2] = issue2;
    	
    	var content = viewer.generateIssueList(issues);
    	
    	db.execute("DELETE FROM Issue WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertNotEqual("", content, "Generated list is empty");
    },
    
    testDBClose: function() {
    	db.close();
    	jsUnity.assertions.assertTrue(1);
    }
    
};
