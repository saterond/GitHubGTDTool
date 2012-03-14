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
        	console.log("Config file's missing!");
        	var temp = Titanium.Filesystem.getFile(resourcesDir, '_config.json');        	
        	var skeleton = temp.read();        	
        	configFile.touch();        	
        	var result = configFile.write(skeleton);
    	}
        var configJSON = configFile.read();        
        this.config = Titanium.JSON.parse(configJSON);       
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
	},
	getSQLDate: function(modify) {
		var datum = new Date();
		if (modify != undefined && modify != 0)
			datum.setDate(datum.getDate() - modify);
		
		var month_really = datum.getMonth() + 1;
		var month = (month_really < 10) ? "0"+month_really : month_really;
		var day_really = datum.getDate();
		var day = (day_really < 10) ? "0"+day_really : day_really;
		var today = datum.getFullYear() + "-" + month + "-" + day;
		
		return today;
	}
});
