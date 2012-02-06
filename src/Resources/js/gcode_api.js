/**
 * @author Ondrej Satera
 */
var GCodeAPI = Class.create({
	authHeader: "",
	restClient: null,
	username: "",
	setAuthHeader: function(_auth) {
		this.authHeader = _auth;
	},
	setRestClient: function(_client) {
		this.restClient = _client;
	},	
	initialize: function(_email, _password) {
		this.email = _email;
		var requestURL = "https://www.google.com/accounts/ClientLogin";
		var dataToSend = "?accountType=GOOGLE&Email="+_email+"&Passwd="+_password+"&service=code&source=ctuFee-gtdDeveloperTasks-0";
		
		client = Titanium.Network.createHTTPClient();
			
		client.onerror = function() {
			Titanium.API.info("error");
		}
		client.onload = function() {
			client.abort();
		}
		if (!client.open("POST", requestURL + dataToSend, false)) {
			Titanium.API.error("Connection with Google Code failed");
		} else {
			var authHeader = "";
			client.receive(function(response) {
				text = response.toString();
				lines = text.split('\n');
				authHeader = lines[2];				
			});
			this.setAuthHeader(authHeader);
			this.setRestClient(new RestClient("", ""));
			this.restClient.setAuth('GoogleLogin ' + this.authHeader);
		}				
	},
	convertIssueToPOSTRequest: function(issue) {
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:issues="http://schemas.google.com/projecthosting/issues/2009">';
		if (issue.id != 0) {
			var id = "https://code.google.com/feeds/issues/p/" + issue.project + "/issues/full/" + issue.id;
			data += "<id>" + id + "</id>";
		}
		data += "<content type='html'>" + issue.description + "</content>";
		data += "<title>" + issue.title + "</title>";
		data += "<author>";
	    data += "<name>" + this.username + "</name>";
	  	data += "</author>";
		issue.labels.each(function(item) {
			data += "<issues:label>"+item+"</issues:label>";
		});		
		if (issue.status != "") {
			data += "<issues:status>"+issue.status+"</issues:status>";
		}
		data += "</entry>";
		
		var file = Titanium.Filesystem.createTempFile();
		file.write(data);
		var uploadStream = Titanium.Filesystem.getFileStream(file);
		uploadStream.open(Titanium.Filesystem.MODE_READ);
		var content = uploadStream.read();
		uploadStream.close();
		
		return content;
	},
	getIssues: function(project, callback) {		
		var name = project.getName();		
		var requestURL = "https://code.google.com/feeds/issues/p/"+name+"/issues/full";		
		this.restClient.sendRequest(requestURL, "GET", this.parseIssues, callback);
	},
	parseIssues: function(xmlDoc, callback) {
		var entries = xmlDoc.getElementsByTagName("entry");
		var name, description, project, status, id, id_full;
		var issues = new Array();
		var count = entries.length;
		for(i = 0; i < count; i++) {				
			id_full = entries[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
			parts = id_full.split('/');
			id = parts[parts.length - 1];
			project = parts[parts.length - 4];
			name = entries[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			description = entries[i].getElementsByTagName("content")[0].childNodes[0].nodeValue;
			status = entries[i].getElementsByTagNameNS("http://schemas.google.com/projecthosting/issues/2009","state")[0].childNodes[0].nodeValue;
			issue = new Issue(id, name, description);
			issue.status = status;
			issue.project = project;
			issues[i] = issue;
		}
		callback(issues);
	},
	getProjects: function(callback) {
		var projects = new Array();
		callback(projects);
	},
	addIssue: function(issue, callback) {
		var name = issue.project;
		var requestURL = "https://code.google.com/feeds/issues/p/"+name+"/issues/full";		
		var content = this.convertIssueToPOSTRequest(issue);
		
		this.restClient.sendFile(requestURL, "POST", content, "", this.confirmNewIssue, callback);
	},
	confirmNewIssue: function(xmlDoc, callback) {
		var entries = xmlDoc.getElementsByTagName("entry");
		var count = entries.length;
		var id_full, parts, number;
		for(i = 0; i < count; i++) {
			id_full = entries[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
			parts = id_full.split('/');
			number = parts[parts.length - 1];					
		}		
		
		callback(number);
	},
	editIssue: function(issue, callback) {
		var name = issue.project;
		var requestURL = "https://code.google.com/feeds/issues/p/"+name+"/issues/full/" + issue.id;		
		var content = this.convertIssueToPOSTRequest(issue);
		
		this.restClient.sendFile(requestURL, "POST", content, "", this.confirmEditIssue, callback);
	},
	confirmEditIssue: function(xmlDoc, callback) {
		callback("Ticket changed");
	}
});
