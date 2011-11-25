Event.observe(window, 'load', function() {
		/*var db = new GTDDatabase('gtdtoolDB');
		var projectsRS = db.executeQuery('SELECT name FROM project');
		
		while(row = projectsRS.getRow()) {
			var name = row.fieldByName("name");
			alert(name);
		}
		db.close();*/
		
		var initOptions = {
			url: "https://api.github.com",
			method: "get",
			timeout: 1000
		};
		
		var client = new GTDClient(initOptions);
		
		var params = {			
		};
		
		var response = client.call(params);		
		if (response == false) {
			alert("chyba");
		} else {
			alert("OK");
		}
});