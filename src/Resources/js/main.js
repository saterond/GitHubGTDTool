Event.observe(window, 'load', function() {
	var app = new GTDApplication();
	if (app.dbOk) {
		var model = new GTDModel(app.getDb());
		Titanium.API.info("Model ready");
		var sync = new Sync(app.getConfig(), app.getDb(), model);
		Titanium.API.info("Sync ready");
		var viewer = new GTDViewer(app.getDb(), model);
		Titanium.API.info("Viewer ready");
		
		viewer.reloadProjects();		
		
		Titanium.API.set("app", app);
		Titanium.API.set("sync", sync);
		Titanium.API.set("viewer", viewer);
		
		var menu = Titanium.UI.createMenu();
		var app = Titanium.UI.createMenuItem("Application");
		app.addItem("New project", handleShowNewProjectDialog);
		app.addItem("New issue", handleShowNewIssueDialog);
		app.addSeparatorItem();
		app.addItem("Configuration", handleShowConfigurationDialog);
		app.addItem("Set auth", handleShowSetAuthDialog);
		app.addSeparatorItem();
		app.addItem("Quit", function(e){
			Titanium.App.exit();
		});
		app.addSeparatorItem();		
		var sync = Titanium.UI.createMenuItem("Synchronization");
		sync.addItem("Reload projects", function(e){
			var viewer = Titanium.API.get("viewer");
			viewer.reloadProjects();
		});
		sync.addItem("Sync projects", function(e){
			var sync = Titanium.API.get("sync");
			sync.syncProjects();
		});
		sync.addItem("Sync users", function(e){
			var sync = Titanium.API.get("sync");
			sync.syncUsers();
		});
		var help = Titanium.UI.createMenuItem("Help");
		help.addItem("Main help", function(e){
			alert("Not ready yet");
		});
		help.addSeparatorItem();
		help.addItem("About Us", function(e){
			alert("Not ready yet");
		});
		var tests = Titanium.UI.createMenuItem("Run tests");
		tests.addItem("Model", handleRunTest);
		menu.appendItem(app);
		menu.appendItem(sync);
		menu.appendItem(help);
		menu.appendItem(tests);
	    Titanium.UI.setMenu(menu);				
	} else {
		Titanium.API.info("Chyba s databazi");
	}		
	Titanium.API.info("Application ready");	
});

Event.observe(window, 'unload', function() {	
	var app = Titanium.API.get("app");
	var db = app.getDb();
	db.close();
});

document.observe("dom:loaded", function() {
	$('saveNewIssue').observe('click', handleShowNewIssueDialog);	
	$('saveNewProject').observe('click', handleShowNewProjectDialog);
	
	$$('li.selection').each(function(li){		
		li.observe("click", function(evt) {
			var key = li.readAttribute("data-key");			
			var viewer = Titanium.API.get("viewer");
			viewer.loadSelection(viewer.getParamsObject("selection", 1));
		})
	});
	
	var handlerSyncIssues = document.on('click', 'button[id="syncIssues"]', handleSyncIssues.bind(this));
	handlerSyncIssues.stop();handlerSyncIssues.start();
	
	var handlerCloseIssue = document.on('click', 'button[id="closeIssue"]', handleCloseIssue.bind(this));
	handlerCloseIssue.stop();handlerCloseIssue.start();
	
	var handlerShowIssueInfo = document.on('click', 'button[class~="showInfo"]', handleShowIssueInfo.bind(this));
	handlerShowIssueInfo.stop();handlerShowIssueInfo.start();
});