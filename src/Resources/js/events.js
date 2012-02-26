/**
 * @author p4nther
 */
$('reload').observe('click', function(evt) {
	var viewer = Titanium.API.get("viewer");
	
	viewer.reloadProjects();	
});

$('loadRepos').observe('click', function(evt) {	
	var sync = Titanium.API.get("sync");
	
	sync.syncProjects();	
});

$('setAuth').observe('click', function(evt) {
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

$('changeConfig').observe('click', function(evt) {	
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

$('saveNewIssue').observe('click', function(evt) {	
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

$('saveNewProject').observe('click', function(evt) {	
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
alert("a");
$$('li.selection').each(function(li){
	alert("a");
	li.observe("click", function(evt) {
		var key = li.readAttribute("data-key");
		
		var viewer = Titanium.API.get("viewer");
		viewer.loadSelection(parseInt(key));
	})
});

var handlerSyncIssues = document.on('click', 'button[id="syncIssues"]', function(event, element) {    	
		var key = element.readAttribute("data-key");
		var parts = key.split('*');
		var project = null;
		
		switch(parseInt(parts[1])) {
			case 1:
				project = new AssemblaProject(parts[0], "");
				break;
			case 2:
				project = new GCodeProject(parts[0], "");
				break;
			case 3:				
				project = new GitHubProject(parts[0], "");
				break;
			default:
				Titanium.API.error("Nepodporovany typ projektu (events)");
		}
		
		var sync = Titanium.API.get("sync");		
		sync.syncIssues(project);
    }.bind(this)
); 
handlerSyncIssues.stop();
handlerSyncIssues.start();

/*var handlerLoadSelection = document.on('click', 'li[class="selection"]', function(event, element) {   	
		var key = element.readAttribute("data-key");
		
		var viewer = Titanium.API.get("viewer");
		viewer.loadSelection(parseInt(key));
    }.bind(this)
); 
handlerLoadSelection.stop();
handlerLoadSelection.start();*/

var handlerCloseIssue = document.on('click', 'button[id="closeIssue"]', function(event, element) {		
		var sync = Titanium.API.get("sync");
		var id = element.readAttribute("data-key");
		
		sync.closeIssue(id);
    }.bind(this)
); 
handlerCloseIssue.stop();
handlerCloseIssue.start();

var handlerShowIssueInfo = document.on('click', 'button[class~="showInfo"]', function(event, element) {
		var key = element.readAttribute('data-key');
		element.toggleClassName("up");
		var div = $("info_"+key);
		div.toggleClassName("hidden");
    }.bind(this)
);
handlerShowIssueInfo.stop();
handlerShowIssueInfo.start();