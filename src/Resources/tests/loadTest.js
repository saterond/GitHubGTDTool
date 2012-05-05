/**
 * @author saterond
 */
var configFile = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json');

if (!configFile.exists()) 
	console.log("Config file's missing!");
var config = Titanium.JSON.parse(configFile.read());
var db = Titanium.Database.open(config.database);
var model = new GTDModel(db);

var LoadTestSuite = {
    suiteName: "Load Test Suite",
    
    setUp: function() {
    },
 
    tearDown: function() {
    },
 
    testGetIssuesByProjectID: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	var user = new User("testLX", "test@xx.cz", project_id);
    	db.execute("INSERT INTO User (name,email,project_id) VALUES (?,?,?)", user.name, user.email, project_id);
    	var user_id = db.lastInsertRowId;
    	
    	var params = new Object();
    	params["project_id"] = project_id;
    	
    	for (var i=0; i < 50; i++) {
			var issue = new Issue(0, "testxx00" + i, "testxx00" + i);
    		db.execute("INSERT INTO Issue (title,description,project_id,user_id,state) VALUES (?,?,?,?,1)", issue.title, issue.description, project_id, user_id);
    		var issue_id = db.lastInsertRowId;
    		var label = new Label(0, issue_id, "label00" + i, project_id);
    		db.execute("INSERT INTO Label (issue_id,text,project_id) VALUES (?,?,?)", label.issue_id, label.text, label.project_id);
    		var label = new Label(0, issue_id, "label01" + i, project_id);
    		db.execute("INSERT INTO Label (issue_id,text,project_id) VALUES (?,?,?)", label.issue_id, label.text, label.project_id);
    		
    		var start = new Date().getTime();
    	
	    	var mo_one = model.getIssues(params);
	    	
	    	var end = new Date().getTime();
			var time = end - start;
			document.write('Execution time: ' + time + "\n<br>");
		};    	    	    
    	
    	db.execute("DELETE FROM Label WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM Issue WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM User WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertTrue(1, "Load test #1 ended");
    },
        
    testDBClose: function() {
    	db.close();
    	jsUnity.assertions.assertTrue(1);
    }
    
};
