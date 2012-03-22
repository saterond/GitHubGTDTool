/**
 * @author saterond
 */
var configFile = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json');

if (!configFile.exists()) 
	console.log("Config file's missing!");
var config = Titanium.JSON.parse(configFile.read());
var db = Titanium.Database.open(config.database);
var model = new GTDModel(db);

var ModelTestSuite = {
    suiteName: "Model Test Suite",       
    
    setUp: function() {
    },
 
    tearDown: function() {
    },
 
    testGetProjects: function() {
    	var project = new Project("TESTXX00", "testxx00");    	
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	var project2 = new Project("TESTXX00", "testxx00");    	
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project2.name, project2.description);
    	var project_id2 = db.lastInsertRowId;
    	
 		var all = db.execute("SELECT count(project_id) as pocet FROM project");
 		var db_count = all.fieldByName("pocet");
 		var projects = model.getProjects();
 		var mo_count = projects.length;
 		
 		db.execute("DELETE FROM project WHERE project_id = ?", project_id);
 		db.execute("DELETE FROM project WHERE project_id = ?", project_id2);
 		
 		jsUnity.assertions.assertEqual(db_count, mo_count, "Model have found different count of projects");
    },
    
    testGetProjectByID: function() {
    	var project = new Project("TESTXX00", "testxx00");    	
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getProject(params);
    	
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(project.name, mo_one.name, "Project names don't match");
    	jsUnity.assertions.assertEqual(project_id, mo_one.project_id, "Project ID's don't match");    	
    },
    
    testGetProjectByNameAndType: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	project.type = 2;
    	db.execute("INSERT INTO project (name,type) VALUES (?,?)", project.name, project.type);
    	var project_id = db.lastInsertRowId;
    	
    	var params = new Object();
    	params["project_name"] = project.name;
    	params["project_type"] = project.type;
    	var mo_one = model.getProject(params);
    	
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(project.name, mo_one.name, "Project names don't match");
    	jsUnity.assertions.assertEqual(project.type, mo_one.type, "Project types don't match");    	
    },
    
    testGetIssuesByProjectID: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	var issue = new Issue(0, "testxx000", "testxx000");
    	db.execute("INSERT INTO Issue (title,description,project_id,user_id,state) VALUES (?,?,?,0,1)", issue.title, issue.description, project_id);
    	var issue2 = new Issue(0, "testxx0002", "testxx0002");
    	db.execute("INSERT INTO Issue (title,description,project_id,user_id,state) VALUES (?,?,?,0,1)", issue2.title, issue2.description, project_id);
    	
    	var count = 2;
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getIssues(params);
    	
    	db.execute("DELETE FROM Issue WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "Issue count don't match");    	
    },
    
    testGetIssuesToday: function() {
    	var datum = new Date();
		var month_really = datum.getMonth() + 1;
		var month = (month_really < 10) ? "0"+month_really : month_really;
		var day_really = datum.getDate();
		var day = (day_really < 10) ? "0"+day_really : day_really;
		var today = datum.getFullYear() + "-" + month + "-" + day;
		
		var issue = new Issue(0, "testxx000", "testxx000");
		issue.dueDate = today;
    	db.execute("INSERT INTO Issue (title,description,dueDate,state) VALUES (?,?,?,1)", issue.title, issue.description, issue.dueDate);
    	var issue_id = db.lastInsertRowId;
		
    	var count = 1;
    	var params = new Object();
    	params["today"] = 1;
    	var mo_one = model.getIssues(params);
    	
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "Issue count don't match");    	
    },
    
    testGetIssue: function() {
    	var issue = new Issue(0, "testxx000", "testxx000");
    	db.execute("INSERT INTO Issue (title,description) VALUES (?,?)", issue.title, issue.description);
    	var issue_id = db.lastInsertRowId;
    	
    	var params = new Object();
    	params["issue_id"] = issue_id;
    	var mo_one = model.getIssue(params);
    	
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	
    	jsUnity.assertions.assertEqual(issue.title, mo_one.title, "Issue titles don't match");
    	jsUnity.assertions.assertEqual(issue_id, mo_one.issue_id, "Issue ID's don't match");    	
    },
    
    testGetLabelsByIssueID: function() {
    	var issue = new Issue(0, "testxx000", "testxx000");
    	db.execute("INSERT INTO Issue (title,description) VALUES (?,?)", issue.title, issue.description);
    	var issue_id = db.lastInsertRowId;
    	var label = new Label(0, issue_id, "testXX00", 0);
    	db.execute("INSERT INTO Label (text,issue_id) VALUES (?,?)", label.text, issue_id);
    	var label2 = new Label(0, issue_id, "testXX002", 0);
    	db.execute("INSERT INTO Label (text,issue_id) VALUES (?,?)", label2.text, issue_id);
    	
    	var count = 2;
    	var params = new Object();
    	params["issue_id"] = issue_id;
    	var mo_one = model.getLabels(params);
    	
    	db.execute("DELETE FROM Label WHERE issue_id = ?", issue_id);
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "Label count don't match");    	
    },
    
    testGetLabelsByProjectID: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	var label = new Label(0, 0, "testXX00", project_id);
    	db.execute("INSERT INTO Label (text,project_id) VALUES (?,?)", label.text, project_id);
    	var label2 = new Label(0, 0, "testXX002", project_id);
    	db.execute("INSERT INTO Label (text,project_id) VALUES (?,?)", label2.text, project_id);
    	
    	var count = 2;
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getLabels(params);
    	
    	db.execute("DELETE FROM Label WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "Label count don't match");    	
    },
    
    testGetDistinctLabels: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;
    	var issue = new Issue(0, "testxx000", "testxx000");
    	db.execute("INSERT INTO Issue (title,description,project_id) VALUES (?,?,?)", issue.title, issue.description, project_id);
    	var issue_id = db.lastInsertRowId;
    	var label = new Label(0, issue_id, "testXX00", 0);
    	db.execute("INSERT INTO Label (text,issue_id) VALUES (?,?)", label.text, issue_id);
    	var label2 = new Label(0, issue_id, "testXX002", 0);
    	db.execute("INSERT INTO Label (text,issue_id) VALUES (?,?)", label2.text, issue_id);
    	
    	var count = 2;
    	
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getDistinctLabels(params);
    	
    	db.execute("DELETE FROM Label WHERE issue_id = ?", issue_id);
    	db.execute("DELETE FROM Issue WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "Label count don't match");    	
    },
    
    testGetMilestones: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	var project_id = db.lastInsertRowId;    	
    	var milestone = new Milestone(0, "testXX00", "", project_id);
    	db.execute("INSERT INTO Milestone (title,project_id) VALUES (?,?)", milestone.title, project_id);
    	var milestone2 = new Milestone(0, "testXX00", "", project_id);
    	db.execute("INSERT INTO Milestone (title,project_id) VALUES (?,?)", milestone2.title, project_id);
    	
    	var count = 2;
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getMilestones(params);
    	
    	db.execute("DELETE FROM Milestone WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "Milestone count don't match");    	
    },
    
    testGetMilestone: function() {
    	var milestone = new Milestone(0, "testXX00", "", 0);
    	db.execute("INSERT INTO Milestone (title) VALUES (?)", milestone.title);
    	var milestone_id = db.lastInsertRowId;
    	var milestone_title = milestone.title;
    	    	
    	var params = new Object();
    	params["milestone_id"] = milestone_id;
    	var mo_one = model.getMilestone(params);
    	
    	db.execute("DELETE FROM Milestone WHERE milestone_id = ?", milestone_id);
    	
    	jsUnity.assertions.assertEqual(milestone_title, mo_one.title, "Milestone titles don't match");
    	jsUnity.assertions.assertEqual(milestone_id, mo_one.milestone_id, "Milestone ID's don't match");
    },
    
    testGetMilestonePercent: function() {
    	var milestone = new Milestone(0, "testXX00", "", 0);
    	db.execute("INSERT INTO Milestone (title) VALUES (?)", milestone.title);
    	var milestone_id = db.lastInsertRowId;
    	var issue = new Issue(0, "TESTXX00", "");
    	issue.state = 1;    	
    	db.execute("INSERT INTO Issue (title,state,milestone_id) VALUES (?,?,?)", issue.title, issue.state, milestone_id);
    	var issue2 = new Issue(0, "TESTXX002", "");
    	issue2.state = 0;
    	db.execute("INSERT INTO Issue (title,state,milestone_id) VALUES (?,?,?)", issue2.title, issue2.state, milestone_id);
    	
    	var percent = 50;
    	var params = new Object();
    	params["milestone_id"] = milestone_id;
    	var mo_percent = model.getMilestonePercent(params);
    	
    	db.execute("DELETE FROM Milestone WHERE milestone_id = ?", milestone_id);
    	db.execute("DELETE FROM Issue WHERE milestone_id = ?", milestone_id);
    	
    	jsUnity.assertions.assertEqual(percent, mo_percent, "Milestone's active percent don't match");
    },
    
    testGetUsers: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	project.type = 1;
    	db.execute("INSERT INTO project (name,description,type) VALUES (?,?,?)", project.name, project.description, project.type);
    	project.project_id = db.lastInsertRowId;
    	var project_id = project.project_id;
    	var user = new User("testXX00", "test@test.cz");
    	user.project_id = project.project_id;
    	db.execute("INSERT INTO User (name,email,project_id) VALUES (?,?,?)", user.name, user.email, user.project_id);
    	var user2 = new User("testXX002", "test2@test.cz");
    	user2.project_id = project.project_id;
    	db.execute("INSERT INTO User (name,email,project_id) VALUES (?,?,?)", user2.name, user2.email, user2.project_id);    	
    	
    	var count = 2;
    	var params = new Object();
    	params["project_id"] = project_id;
    	var mo_one = model.getUsers(params);
    	
    	db.execute("DELETE FROM Project WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM User WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(count, mo_one.length, "User count don't match");
    },
    
    testGetUser: function() {
    	var user = new User("testXX00", "test@test.cz");
    	db.execute("INSERT INTO User (name,email) VALUES (?,?)", user.name, user.email);
    	var user_id = db.lastInsertRowId;
    	var user_name = user.name;
    	    	
    	var params = new Object();
    	params["user_id"] = user_id;
    	var mo_one = model.getUser(params);
    	
    	db.execute("DELETE FROM User WHERE user_id = ?", user_id);
    	
    	jsUnity.assertions.assertEqual(user_name, mo_one.name, "User names don't match");
    	jsUnity.assertions.assertEqual(user_id, mo_one.user_id, "User ID's don't match");
    },
    
    testGetAreas: function() {
    	var area = new Area(0, "testxx00");
    	db.execute("INSERT INTO Area (title) VALUES (?)", area.title);
    	var area_id = db.lastInsertRowId;
    	var area2 = new Area(0, "testxx002");
    	db.execute("INSERT INTO Area (title) VALUES (?)", area2.title);
    	var area_id2 = db.lastInsertRowId;
    	
 		var all = db.execute("SELECT count(area_id) as pocet FROM Area");
 		var db_count = all.fieldByName("pocet");
 		var areas = model.getAreas();
 		var mo_count = areas.length;
 		
 		db.execute("DELETE FROM Area WHERE area_id = ?", area_id);
 		db.execute("DELETE FROM Area WHERE area_id = ?", area_id2);
 		
 		jsUnity.assertions.assertEqual(db_count, mo_count, "Model have found different count of areas");
    },
    
    testGetArea: function() {
    	var area = new Area(0, "testxx00");
    	db.execute("INSERT INTO Area (title) VALUES (?)", area.title);
    	var area_id = db.lastInsertRowId;
    	
    	var params = new Object();
    	params["area_id"] = area_id;
    	var mo_area = model.getArea(params);
 		
 		db.execute("DELETE FROM Area WHERE area_id = ?", area_id); 		
 		
 		jsUnity.assertions.assertEqual(area.title, mo_area.title, "Area titles don't match");
    },
    
    testSaveProject: function() {
    	var name = "TEST", description = "TEST", state = 0;
    	var new_project = new Project(name, description);
    	new_project.state = state;    	    	
    	
    	var labels = new Array(), i = 0;
    	labels[++i] = new Label(0, 0, "test", 0);
    	labels[++i] = new Label(0, 0, "test2", 0);
    	new_project.labels = labels;
    	
    	var area_name = "work00XX00TEST";
    	var area = new Area(0, area_name);
    	new_project.area = area;
    	
    	var project_id = model.saveProject(new_project);    	    	
    	
    	var project = db.execute("SELECT name,description,state,area_id FROM project WHERE project_id = ?", project_id);
    	var labels = db.execute("SELECT count(label_id) as pocet FROM Label WHERE project_id = ?", project_id);
    	var area = db.execute("SELECT area_id FROM Area WHERE title = ?", area_name);
    	
    	var db_name = project.fieldByName("name"), 
    		db_description = project.fieldByName("description"), 
    		db_state = project.fieldByName("state"),
    		db_project_area_id = project.fieldByName("area_id"),
    	 	db_label_count = labels.fieldByName("pocet"),
    		db_area_id = area.fieldByName("area_id");
    	
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM Label WHERE project_id = ?", project_id);
    	db.execute("DELETE FROM Area WHERE title = ?", area_name);
    	
    	jsUnity.assertions.assertEqual(name, db_name, "Project names don't match");
    	jsUnity.assertions.assertEqual(description, db_description, "Project descriptions don't match");
    	jsUnity.assertions.assertEqual(state, db_state, "Project states don't match");
    	jsUnity.assertions.assertEqual(i, db_label_count, "Project label count don't match");
    	jsUnity.assertions.assertEqual(db_area_id, db_project_area_id, "Project area ID's don't match");
    },
    
    testSaveIssue: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	project.type = 1;
    	db.execute("INSERT INTO project (name,description,type) VALUES (?,?,?)", project.name, project.description, project.type);
    	project.project_id = db.lastInsertRowId;
    	
    	var title = "TEST", description = "TEST", state = 1;
    	var issue = new Issue(0, title, description);
    	issue.state = state;
    	issue.project = project;
    	
    	var labels = new Array(), i = 0;
    	labels[++i] = new Label(0, 0, "test", 0);
    	labels[++i] = new Label(0, 0, "test2", 0);
    	issue.labels = labels;
    	
    	var milestone_title = "work00XX00TEST";
    	var milestone = new Milestone(0, milestone_title, "", 0);
    	issue.milestone = milestone;
    	
    	var issue_id = model.saveIssue(issue);
    	
    	var issue = db.execute("SELECT title,description,state,milestone_id FROM Issue WHERE issue_id = ?", issue_id);
    	var labels = db.execute("SELECT count(label_id) as pocet FROM Label WHERE issue_id = ?", issue_id);
    	var milestone = db.execute("SELECT milestone_id FROM Milestone WHERE title = ?", milestone_title);
    	
    	var db_title = issue.fieldByName("title"),
    		db_description = issue.fieldByName("description"),
    		db_state = issue.fieldByName("state"),
    		db_issue_milestone_id = issue.fieldByName("milestone_id"),
    		db_label_count = labels.fieldByName("pocet"),
    		db_milestone_id = milestone.fieldByName("milestone_id");
    	
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	db.execute("DELETE FROM Label WHERE issue_id = ?", issue_id);
    	db.execute("DELETE FROM Milestone WHERE title = ?", milestone_title);
    	db.execute("DELETE FROM project WHERE project_id = ?", project.project_id);
    	
    	jsUnity.assertions.assertEqual(title, db_title, "Issue titles don't match");
    	jsUnity.assertions.assertEqual(description, db_description, "Issue descriptions don't match");
    	jsUnity.assertions.assertEqual(state, db_state, "Issue states don't match");
    	jsUnity.assertions.assertEqual(i, db_label_count, "Issue label count don't match");
    	jsUnity.assertions.assertEqual(db_milestone_id, db_issue_milestone_id, "Issue milestone ID's don't match");
    },
    
    testSaveIssueNumber: function() {
    	var title = "TEST", description = "TEST", id = 1;
    	db.execute("INSERT INTO Issue (title,description) VALUES (?,?)", title, description);
    	var issue_id = db.lastInsertRowId;
    	var issue = new Issue(id, title, description);
    	issue.issue_id = issue_id;
    	
    	model.saveIssueNumber(issue);
    	
    	var number = db.execute("SELECT id FROM Issue WHERE issue_id = ?", issue_id);
    	var db_id = number.fieldByName("id");
    	
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	
    	jsUnity.assertions.assertEqual(id, db_id, "Issue ID's don't match");
    },
    
    testSaveLabels: function() {
    	var title = "TEST", description = "TEST", id = 1;
    	db.execute("INSERT INTO Issue (title,description) VALUES (?,?)", title, description);
    	var issue_id = db.lastInsertRowId;
    	
    	var labels = new Array(), i = 0;
    	labels[++i] = new Label(0, 0, "test", 0);
    	labels[++i] = new Label(0, 0, "test2", 0);
    	
    	model.saveLabels(labels, issue_id, 0);
    	
    	var labels = db.execute("SELECT count(label_id) as pocet FROM Label WHERE issue_id = ?", issue_id);
    	var count = labels.fieldByName("pocet");
    	
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	db.execute("DELETE FROM Label WHERE issue_id = ?", issue_id);
    	
    	jsUnity.assertions.assertEqual(i, count, "Labels count don't match");
    },
    
    testSaveMilestone: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	project_id = db.lastInsertRowId;
    	
    	var title = "TESTXXX000";
    	var milestone = new Milestone(0, title, "", project_id);
    	
    	var milestone_id = model.saveMilestone(milestone);
    	
    	var milestone = db.execute("SELECT title FROM Milestone WHERE milestone_id = ?", milestone_id);
    	var db_title = milestone.fieldByName("title");
    	
    	db.execute("DELETE FROM Milestone WHERE title = ?", title);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(title, db_title, "Milestone titles don't match");
    },
    
    testSaveUser: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	project_id = db.lastInsertRowId;
    	
    	var name = "TESTXX00", email = "test@test.cz";
    	var user = new User(name, email, null);
    	
    	var user_id = model.saveUser(user, project_id);
    	
    	var users = db.execute("SELECT name FROM User WHERE user_id = ?", user_id);
    	var db_name = users.fieldByName("name");
    	
    	db.execute("DELETE FROM User WHERE name = ?", name);
    	db.execute("DELETE FROM project WHERE project_id = ?", project_id);
    	
    	jsUnity.assertions.assertEqual(name, db_name, "User names don't match");
    },
    
    testSaveUserWithProject: function() {
    	var project = new Project("TESTXX00", "testxx00");
    	db.execute("INSERT INTO project (name,description) VALUES (?,?)", project.name, project.description);
    	project.project_id = db.lastInsertRowId;
    	
    	var name = "TESTXX00", email = "test@test.cz";
    	var user = new User(name, email, null);
    	user.project = project;
    	
    	var user_id = model.saveUser(user);
    	
    	var users = db.execute("SELECT name,project_id FROM User WHERE user_id = ?", user_id);
    	var db_name = users.fieldByName("name");
    	var db_project_id = users.fieldByName("project_id");
    	
    	db.execute("DELETE FROM User WHERE name = ?", name);
    	db.execute("DELETE FROM project WHERE project_id = ?", project.project_id);
    	
    	jsUnity.assertions.assertEqual(name, db_name, "User names don't match");
    	jsUnity.assertions.assertEqual(project.project_id, db_project_id, "User project ID's don't match");
    },
    
    testSaveArea: function() {
    	var title = "TESTXX00";
    	var area = new Area(0, title);
    	
    	var area_id = model.saveArea(area);
    	
    	var areas = db.execute("SELECT title FROM Area WHERE area_id = ?", area_id);
    	var db_title = areas.fieldByName("title");
    	
    	db.execute("DELETE FROM Area WHERE title = ?", title);
    	
    	jsUnity.assertions.assertEqual(title, db_title, "Area titles don't match");
    },
    
    testMoveToTrash: function() {
    	var title = "TEST", description = "TEST", state = 1, status = "aa";
    	db.execute("INSERT INTO Issue (title,description,state,status) VALUES (?,?,?,?)", 
    		title, description, state, status);
    	var issue_id = db.lastInsertRowId;
    	
    	var rs = db.execute("SELECT count(issue_id) as pocet FROM Trash");
    	var trash_count_pre = rs.fieldByName("pocet");
    	
    	model.moveToTrash(issue_id);
    	
    	rs = db.execute("SELECT count(issue_id) as pocet FROM Trash");
    	var trash_count_post = rs.fieldByName("pocet");
    	
    	db.execute("DELETE FROM Issue WHERE issue_id = ?", issue_id);
    	
    	jsUnity.assertions.assertEqual(++trash_count_pre, trash_count_post, "Issue haven't been moved to trash");
    	
    	db.execute("DELETE FROM Trash WHERE issue_id = ?", issue_id);
    },
    
    testDBClose: function() {
    	db.close();
    	jsUnity.assertions.assertTrue(1);
    }
    
};
