/**
 * @author Ondrej Satera
 */
var GCodeAPI = Class.create({
	authHeader: "",
	restClient: null,
	setAuthHeader: function(_auth) {
		this.authHeader = _auth;
	},
	setRestClient: function(_client) {
		this.restClient = _client;
	},	
	initialize: function(_email, _password) {
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
	}
});
