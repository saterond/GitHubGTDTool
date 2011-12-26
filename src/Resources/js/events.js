/**
 * @author p4nther
 */
$('reload').observe('click', function(evt) {
	var viewer = Titanium.API.get("viewer");
	
	viewer.reloadProjects();	
});

$('loadRepos').observe('click', function(evt) {	
	var sync = Titanium.API.get("sync");
	
	sync.syncRepositories();	
});

$('setAuth').observe('click', function(evt) {	
	Titanium.UI.showDialog({
		id: "authDialog",		
		url: "app://dialogs/auth.html",
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

$('saveNewIssue').observe('click', function(evt) {	
	Titanium.UI.showDialog({
		id: "issueDialog",		
		url: "app://dialogs/newIssue.html",
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

var handlerSyncIssues = document.on('click', 'button[id="syncIssues"]', function(event, element) {    	
		var sync = Titanium.API.get("sync");
		var repo = element.readAttribute("data-key");
		
		sync.syncIssues(repo);
    }.bind(this)
); 
handlerSyncIssues.stop();
handlerSyncIssues.start();

var handlerLoadIssues = document.on('click', 'button[id="loadIssues"]', function(event, element) {   	
		var viewer = Titanium.API.get("viewer");
		var repo = element.readAttribute("data-key");
		
		viewer.reloadIssues(repo);
    }.bind(this)
); 
handlerLoadIssues.stop();
handlerLoadIssues.start();

var handlerCloseIssue = document.on('click', 'button[id="closeIssue"]', function(event, element) {		
		var sync = Titanium.API.get("sync");
		var id = element.readAttribute("data-key");
		
		sync.closeIssue(id);
    }.bind(this)
); 
handlerCloseIssue.stop();
handlerCloseIssue.start();