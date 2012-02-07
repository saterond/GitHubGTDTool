Event.observe(window, 'load', function() {
	var app = new GTDApplication();
	if (app.dbOk) {
		var sync = new Sync(app.getConfig(), app.getDb());
		var viewer = new GTDViewer(app.getDb());		
		
		viewer.reloadProjects();
		
		Titanium.API.set("app", app);
		Titanium.API.set("sync", sync);
		Titanium.API.set("viewer", viewer);
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