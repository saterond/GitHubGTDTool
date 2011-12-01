var GTDApplication = Class.create({
	config: [],
	db: null,
	dbOk: false,
	initialize: function() {
		this.setConfig();
		this.connectToDatabase();
	},
	setConfig: function() {
		var resourceDir = Titanium.Filesystem.getResourcesDirectory();	
	    var configFile = Titanium.Filesystem.getFile(resourceDir, 'config.json');
	    var configStream = Titanium.Filesystem.getFileStream(configFile);
	    
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
	}
});
