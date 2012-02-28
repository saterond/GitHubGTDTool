/**
 * @author saterond
 */
var DataTestSuite = {
    suiteName: "Data Test Suite",
    db: null,
    config: null,
 
    setUp: function() {
 		var resourcesDir = Titanium.Filesystem.getResourcesDirectory();	
	    var configFile = Titanium.Filesystem.getFile(resourcesDir, 'config.json');
	    
	    if (!configFile.exists()) {
        	console.log("Config file's missing!");
    	}
        var configJSON = configFile.read();
        this.config = Titanium.JSON.parse(configJSON);
        this.db = Titanium.Database.open(this.config.database);
    },
 
    tearDown: function() {
 		this.db.close();
    },
 
    testInit: function() {
 		jsUnity.assertions.assertTrue(true);
    }
    
};