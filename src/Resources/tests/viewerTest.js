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
    
    testGetFileContentExistingFile: function() {
    	var resourceDir = Titanium.Filesystem.getResourcesDirectory();
    	var filename = "test.txt";
    	var testFile = Titanium.Filesystem.getFile(resourceDir, filename);
    	var text = "aaaBBBcccDDD";
    	testFile.write(text);
    	
    	var content = viewer.getFileContent(filename);
    	
    	jsUnity.assertions.assertEqual(text, content, "File contents don't match'");
    	
    	testFile.deleteFile();
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
    	
    	jsUnity.assertions.assertNotEqual("", content, "Generated list of issues is empty");
    },
    
    testGenerateProjectList: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	project.project_id = 1;
    	var project2 = new Project("TESTXX01", "testxx01");
    	project2.project_id = 2;
    	
    	var issue_counts = new Array();
    	issue_counts[1] = new Array();
    	issue_counts[1]["all"] = 0;
    	issue_counts[1]["completed"] = 0;
    	issue_counts[1]["due"] = 0;
    	issue_counts[2] = new Array();
    	issue_counts[2]["all"] = 0;
    	issue_counts[2]["completed"] = 0;
    	issue_counts[2]["due"] = 0;
    	
    	var projects = new Array();
    	projects[1] = project;
    	projects[2] = project2;
    	
    	var content = viewer.generateProjectList(projects, issue_counts);
    	
    	jsUnity.assertions.assertNotEqual("", content, "Generated list of projects is empty");
    },
    
    testIsProjectActiveOnActiveProject: function() {
    	Titanium.API.set("active", "project*0*1");
    	var state = viewer.isProjectActive(1);
    	
    	jsUnity.assertions.assertTrue(state, "Project is false inactive");
    },
    
    testIsProjectActiveOnInactiveProject: function() {
    	Titanium.API.set("active", "project*0*1");
    	var state = viewer.isProjectActive(2);
    	
    	jsUnity.assertions.assertFalse(state, "Project is false active");
    },
    
    testDBClose: function() {
    	db.close();
    	jsUnity.assertions.assertTrue(1);
    }
};
