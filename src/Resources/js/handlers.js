/**
 * @author saterond
 */
function handleShowNewIssueDialog(event) {
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
}

function handleShowEditIssueDialog(event, element) {
	var key = element.readAttribute("data-key");
	Titanium.API.set("editIssue", key);
	Titanium.UI.showDialog({
		id: "editIssueDialog",		
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
}

function handleShowNewProjectDialog(event) {
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
}

function handleShowEditProjectDialog(event, element) {
	var key = element.readAttribute("data-key");
	if (key != 0) {
		Titanium.API.set("editProject", key);
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
	}
}

function handleShowConfigurationDialog(event) {
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
}

function handleShowSetAuthDialog(event) {
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
}

function handleSelectProject(event, element) {
	var key = element.readAttribute("data-key");
	var parts = key.split('*');
	
	var viewer = Titanium.API.get("viewer");
	viewer.reloadIssues(parts[2]);
}

function handleSelectLabel(event, element) {
	var key = element.readAttribute("data-key");
	
	var viewer = Titanium.API.get("viewer");
	viewer.loadSelection(viewer.getParamsObject("label", key));
}

function handleSyncIssues(event, element) {	
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
}

function handleCloseIssue(event, element) {
	var sync = Titanium.API.get("sync");
	var id = element.readAttribute("data-key");
	
	sync.closeIssue(id);
}

function handleShowIssueInfo(event, element) {
	var key = element.readAttribute('data-key');
	element.toggleClassName("up");
	var div = $("info_"+key);
	div.toggleClassName("hidden");
}

function handleRunModelTest(event, element) {
	Titanium.UI.showDialog({
		id: "unitTestDialog",		
		url: "app://tests/runModelTest.html",
		baseURL: "app://",
		width: 500,
		height: 580,
		visible: true,
		closeable: true,
		maximizable: true,
		resizable: true,
		topMost: true
	});	
}

function handleRunViewerTest(event, element) {
	Titanium.UI.showDialog({
		id: "unitTestDialog",		
		url: "app://tests/runViewerTest.html",
		baseURL: "app://",
		width: 500,
		height: 580,
		visible: true,
		closeable: true,
		maximizable: true,
		resizable: true,
		topMost: true
	});	
}

function handlePrint(event, element) {
	window.print();
}

function handleSaveIssueToArchive(event, element) {
	var viewer = Titanium.API.get("viewer");
	var model = Titanium.API.get("model");
	var id = element.readAttribute("data-key");
	
	model.archiveIssue(id);
	
	var active_project = Titanium.API.get("active");
	var parts = active_project.split("*");
	var params = new Object();
	if (parts[0] == "project") {
		var project_id = parts[2];
		viewer.reloadIssues(project_id);
	} else if (parts[0] == "label") {
		var label = parts[2];
		params["label"] = label;
		viewer.loadSelection(params);
	} else {
		var selection = parts[2];
		params["selection"] = selection;
		viewer.loadSelection(params);
	}
}

function handleMoveToTrash(event, element) {
	var viewer = Titanium.API.get("viewer");
	var model = Titanium.API.get("model");
	var id = element.readAttribute("data-key");
	
	model.moveToTrash(id);
	
	var active_project = Titanium.API.get("active");
	var parts = active_project.split("*");
	var params = new Object();
	if (parts[0] == "project") {
		var project_id = parts[2];
		viewer.reloadIssues(project_id);
	} else if (parts[0] == "label") {
		var label = parts[2];
		params["label"] = label;
		viewer.loadSelection(params);
	} else {
		var selection = parts[2];
		params["selection"] = selection;
		viewer.loadSelection(params);
	}
}
