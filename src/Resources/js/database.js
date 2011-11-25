/**
 * @author saterond
 */
var GTDDatabase = Class.create({
	dbName: "",
	instance: null,
	initialize: function(name) {
		this.dbName = name;
		this.instance = Titanium.Database.open(name);
	},
	executeQuery: function(sql) {
		var q = this.instance.execute(sql);		
		return new GTDQuery(q);
	},
	close: function() {
		this.instance.close();
	}
});

var GTDQuery = Class.create({
	query: null,
	initialize: function(query) {
		this.query = query;
	},
	getRow: function() {
		if (this.query.isValidRow()) {
			var row = this.query;
			this.query.next();
			return row;
		} else {
			return false;
		}
	}
});
