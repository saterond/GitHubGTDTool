/**
 * Trida slouzici jako proxy mezi aplikaci a API sluzby Assembla. 
 * Je definovana jako potomek 'abstraktni' tridy API.
 * 
 * @author Ondrej Satera
 */
var AssemblaAPI = Class.create(API, {
	username: "",
	password: "",
	user_id: "",
	initialize : function(_username, _password, _user_id) {
		this.username = _username;
		this.password = _password;
		this.user_id = _user_id;
	},
	makeAPICall: function(_url) {
		var requestURL = _url;
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var xmlText = this.responseText;			
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
		  	return xmlDoc;			
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {Titanium.API.info("error");}
		if (!client.open("GET", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.send(); 
		}	
	},
	getProjects : function(callback) {
		var requestURL = "https://www.assembla.com/spaces/my_spaces";		
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var xmlText = this.responseText;
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
			var spaces = xmlDoc.getElementsByTagName("space");
			var name, description, project;
			var projects = new Array();
			var count = spaces.length;
			for(i = 0; i < count; i++) {				
				name = spaces[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
				description = "Assembla space";
				project = new Project(name, description);
				projects[i] = project;
			}
			callback(projects);		
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {Titanium.API.info("error");}
		if (!client.open("GET", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.send(); 
		}
	},
	getIssues: function(project, callback) {
		var name = project.getName();
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets/";
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var xmlText = this.responseText;
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
			var tickets = xmlDoc.getElementsByTagName("ticket");
			var name, description, project, status, id;
			var issues = new Array();
			var count = tickets.length;
			for(i = 0; i < count; i++) {				
				id = tickets[i].getElementsByTagName("number")[0].childNodes[0].nodeValue;
				name = tickets[i].getElementsByTagName("summary")[0].childNodes[0].nodeValue;
				description = tickets[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
				status = tickets[i].getElementsByTagName("status-name")[0].childNodes[0].nodeValue;
				project = tickets[i].getElementsByTagName("space-id")[0].childNodes[0].nodeValue;
				issue = new Issue(id, name, description);
				issue.status = status;
				issue.project = project;
				issues[i] = issue;
			}
			callback(issues);
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {Titanium.API.info("error");}
		if (!client.open("GET", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.send(); 
		}
	},
	getUsers: function(project, callback) {
		var name = project.getName();
		var requestURL = "http://www.assembla.com/spaces/"+name+"/users/";
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var xmlText = this.responseText;			
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
			var workers = xmlDoc.getElementsByTagName("user");
			var name, email, project;
			var users = new Array();
			var count = users.length;
			for(i = 0; i < count; i++) {				
				name = workers[i].getElementsByTagName("login")[0].childNodes[0].nodeValue;
				email = workers[i].getElementsByTagName("email")[0].childNodes[0].nodeValue;
				project = project.getName();
				user = new User(name, email, project);
				users[i] = user;
			}
			callback(users);
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {Titanium.API.info("error");}
		if (!client.open("GET", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.send(); 
		}
	},
	getLabels: function(project, callback) {
		Titanium.info("Assembla doesn't support labels");
		return [];
	},
	addProject: function(project, callback) {
		callback("Not yet implemented");
		var requestURL = "http://www.assembla.com/spaces/create_via_api";
		
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += "<space>";
		data += "<name>" + project.getName() + "</name>";
		data += "<wiki-name>" + project.getName() + "</wiki-name>";
		data += "<description>" + project.getDescription() + "</description>";
		data += "<wiki-format>3</wiki-format>";
		data += "<team-permissions>1</team-permissions>";
		data += "<public-permissions>0</public-permissions>";
		data += '<is-commercial type="boolean">false</is-commercial>';
		data += "</space>";
		
		var file = Titanium.Filesystem.createTempFile();
		file.write(data);
		var full_filename = file.toString();
		var arr = full_filename.split("\\");
		var index = arr.length - 1;
		var filename = arr[index];
		var boundary = '----12345568790';
		header = "--" + boundary + "\r\n";
		header += 'Content-Disposition: form-data; name="'+filename+'"; filename="'+filename+'"';		
		header += "Content-Type: application/xml\r\n\r\n";		
		
		var uploadStream = Titanium.Filesystem.getFileStream(file);
		
		uploadStream.open(Titanium.Filesystem.MODE_READ);
		content = uploadStream.read();
		uploadStream.close();
		
		var fullContent = header + content + "\r\n--" + boundary + "--";
		console.log(fullContent);
		
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			console.log(this.responseText);
			var message = "Space created";
			callback(message);
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {callback("error " + this.status + ": " + this.statusText);}
		if (!client.open("POST", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.setRequestHeader("Content-type", "application/xml; boundary=\"" + boundary + "\"");
			client.setRequestHeader("Connection", "close");
			client.send(fullContent);
		}
	},
	addIssue: function(issue, callback) {
		var name = issue.project;
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets";
		
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += "<ticket>";
		data += "<number>" + issue.id + "</number>";
		data += "<summary>" + issue.title + "</summary>";
		data += "<priority>1</priority>";
		data += "<status>0</status>";
		data += "</ticket>";
		
		var file = Titanium.Filesystem.createTempFile();
		file.write(data);
		var full_filename = file.toString();
		var arr = full_filename.split("\\");
		var index = arr.length - 1;
		var filename = arr[index];
		var boundary = '----12345568790';
		header = "--" + boundary + "\r\n";
		header += 'Content-Disposition: form-data; name="'+filename+'"; filename="'+filename+'"';		
		header += "Content-Type: application/xml\r\n\r\n";		
		
		var uploadStream = Titanium.Filesystem.getFileStream(file);
		
		uploadStream.open(Titanium.Filesystem.MODE_READ);
		content = uploadStream.read();
		uploadStream.close();
		
		var fullContent = header + content + "\r\n--" + boundary + "--";
		
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			console.log(this.responseText);
			var message = "Issue created";
			callback(message);
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {callback("error " + this.status + ": " + this.statusText);}
		if (!client.open("POST", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.setRequestHeader("Content-type", "application/xml; boundary=\"" + boundary + "\"");
			client.setRequestHeader("Connection", "close");
			client.send(fullContent);
		}
	},
	editIssue: function(issue, callback) {
		var name = issue.project;
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets/"+issue.id;
		
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += "<ticket>";
		data += "<number>" + issue.id + "</number>";
		data += "<summary>" + issue.title + "</summary>";
		data += "<priority>1</priority>";
		data += "<status>" + issue.status + "</status>";
		data += "</ticket>";
		
		var file = Titanium.Filesystem.createTempFile();
		file.write(data);
		var full_filename = file.toString();
		var arr = full_filename.split("\\");
		var index = arr.length - 1;
		var filename = arr[index];
		var boundary = '----12345568790';
		header = "--" + boundary + "\r\n";
		header += 'Content-Disposition: form-data; name="'+filename+'"; filename="'+filename+'"';		
		header += "Content-Type: application/xml\r\n\r\n";		
		
		var uploadStream = Titanium.Filesystem.getFileStream(file);
		
		uploadStream.open(Titanium.Filesystem.MODE_READ);
		content = uploadStream.read();
		uploadStream.close();
		
		var fullContent = header + content + "\r\n--" + boundary + "--";
		
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			console.log(this.responseText);
			var message = "Issue changed";
			callback(message);
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {callback("error " + this.status + ": " + this.statusText);}
		if (!client.open("PUT", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.setRequestHeader("Content-type", "application/xml; boundary=\"" + boundary + "\"");
			client.setRequestHeader("Connection", "close");
			client.send(fullContent);
		}
	},
	deleteIssue: function(issue, callback) {
		var name = issue.project;
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets/"+issue.id;
		
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			console.log(this.responseText);
			var message = "Issue deleted";
			callback(message);
		}
		client.onreadystatechange = function() {console.log(this.status + ": " + this.statusText);}
		client.onerror = function() {callback("error " + this.status + ": " + this.statusText);}
		if (!client.open("DELETE", requestURL, true)) {
			Titanium.API.info("Connection with Assembla failed");
		} else {
			authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
	    	client.setRequestHeader("Authorization", authstr);
	    	client.setRequestHeader("Accept", "application/xml");    	
	    	
	    	client.send();
		}
	}
});