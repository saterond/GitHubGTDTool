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
		app.addItem("New project", function(e){
			Titanium.UI.showDialog({
				id: "projectDialog",		
				url: "app://templates/newProject.html",
				baseURL: "app://",
				width: 660,
				height: 350,
				visible: true,
				closeable: true,
				maximizable: false,
				resizable: false,
				topMost: true
			});
		});
		app.addItem("New issue", function(e){
			Titanium.UI.showDialog({
				id: "issueDialog",		
				url: "app://templates/newIssue.html",
				baseURL: "app://",
				width: 700,
				height: 410,
				visible: true,
				closeable: true,
				maximizable: false,
				resizable: false,
				topMost: true
			});
		});
		app.addSeparatorItem();
		app.addItem("Configuration", function(e){
			Titanium.UI.showDialog({
				id: "configDialog",		
				url: "app://templates/config.html",
				baseURL: "app://",
				width: 350,
				height: 450,
				visible: true,
				closeable: true,
				maximizable: false,
				resizable: false,
				topMost: true
			});
		});
		app.addItem("Set auth", function(e){
			Titanium.UI.showDialog({
				id: "authDialog",		
				url: "app://templates/auth.html",
				baseURL: "app://",
				width: 200,
				height: 150,
				visible: true,
				closeable: true,
				maximizable: false,
				resizable: false,
				topMost: true
			});
		});
		app.addSeparatorItem();
		app.addItem("Quit", function(e){
			Titanium.App.exit();
		});
		var sync = Titanium.UI.createMenuItem("Synchronization");
		sync.addItem("Reload projects", function(e){
			var viewer = Titanium.API.get("viewer");
			viewer.reloadProjects();
		});
		sync.addItem("Sync projects", function(e){
			var sync = Titanium.API.get("sync");
			sync.syncProjects();
		});
		var help = Titanium.UI.createMenuItem("Help");
		help.addItem("Main help", function(e){
			alert("Not ready yet");
		});
		help.addSeparatorItem();
		help.addItem("About Us", function(e){
			alert("Not ready yet");
		});
		menu.appendItem(app);
		menu.appendItem(sync);
		menu.appendItem(help);
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