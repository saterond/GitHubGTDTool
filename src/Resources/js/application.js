var GTDApplication = Class.create({
	config: [],
	db: null,
	dbOk: false,
	initialize: function() {
		this.setConfig();
		this.connectToDatabase();
	},
	setConfig: function() {
		var resourcesDir = Titanium.Filesystem.getResourcesDirectory();	
	    var configFile = Titanium.Filesystem.getFile(resourcesDir, 'config.json');
	    
	    if (!configFile.exists()) {
        	alert("Config file's missing!");
    	} else {        
	        var configJSON = configFile.read();        
	        this.config = Titanium.JSON.parse(configJSON);
       }
	},
	connectToDatabase: function() {
		this.db = Titanium.Database.open(this.config.database);
		this.dbOk = true;
	},
	getDb: function() {
		return this.db;
	},
	getConfig: function() {
		return this.config;
	},
	saveAuth: function(username, password) {
		var tok = username + ':' + password;
		var hash = Base64.encode(tok);
		var auth = "Basic " + hash;
		
		this.config.github.auth = auth;
		
		var file = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json');
		file.write(Titanium.JSON.stringify(this.config));
	},
	saveConfig: function() {
		var file = Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json');
		file.write(Titanium.JSON.stringify(this.config));
		
		Titanium.API.info('Configuration file has been changed!');
	}
});
