Event.observe(window, 'load', function() {
	var app = new GTDApplication();
   	if (app.dbOk) {
	   	var db = app.getDb();
	   	
		var projectsRS = db.execute("SELECT * FROM Project");
		var content = "";		
		while (projectsRS.isValidRow()) {			
			var projectId = projectsRS.fieldByName('project_id');
			var projectName = projectsRS.fieldByName('name');
			content += "<li class=\"project\">" + projectName + " - ";
			content += '<button class="loadIssues" data-key="'+projectName+'">nacti ukoly</button>';			
			content += '</li>';		
			projectsRS.next();
		}
		projectsRS.close();
		jQuery.noConflict();
		
		jQuery("ul#projects").empty();
		jQuery("ul#issues").empty();
		jQuery("ul#projects").html(content);					
	}
	
	jQuery(".loadRepos").click(function() {			   
	    var configStream = Titanium.Filesystem.getFileStream(Titanium.Filesystem.getFile(Titanium.Filesystem.getResourcesDirectory(), 'config.json'));		
        var config = Titanium.JSON.parse(configStream.read());
		var db = Titanium.Database.open(config.database);
		
		var username = config.username;
		
		jQuery(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader">');
		GitHubAPI.Repos(username, function(json){					
			var content = "";					
			var j = 2;			
			jQuery.each(json.data, function(i){
				projectName = json.data[i].name;				
				db.execute("INSERT INTO Project (project_id,name) VALUES (?,?)", j, projectName);							
				j = j + 1; 											
			});	
			db.close();		
			jQuery("img.loader").remove();
		});					
	});	
});

Event.observe(window, 'load', function() {
	db.close();
});