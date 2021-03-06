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
	restClient: null,
	initialize : function(_username, _password, _user_id) {
		this.username = _username;
		this.password = _password;
		this.user_id = _user_id;
		this.restClient = new RestClient(_username, _password);
	},
	webalizeString: function(str) {
		str = str.replace(/ /gi, "-");
		str = str.toLowerCase();
		
		var sdiak = "áäčďéěíĺľňóô öŕšťúů üýřžÁÄČĎÉĚÍĹĽŇÓÔ ÖŔŠŤÚŮ ÜÝŘŽ"; 
		var bdiak = "aacdeeillnoo orstuu uyrzAACDEEILLNOO ORSTUU UYRZ"; 		
		var txt = "", pos = 0;                
        for(var i = 0; i < str.length; i++) {            
            pos = sdiak.indexOf(str.charAt(i));
            if (pos != -1) {                
                txt += bdiak.charAt(pos); 
            } else {
                txt += str.charAt(i);
            }
        }
		str = txt;
		
		return str;
	},
	getProjects : function(callback) {
		var requestURL = "https://www.assembla.com/spaces/my_spaces";		
		this.restClient.sendRequest(requestURL, "GET", this.parseProjects, callback);
	},
	parseProjects: function(xmlDoc, callback) {
		var spaces = xmlDoc.getElementsByTagName("space");
		var name, description, project;
		var projects = new Array();
		var count = spaces.length;
		for(i = 0; i < count; i++) {				
			name = spaces[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
			description = "Assembla space";
			project = new AssemblaProject(name, description);			
			projects[i] = project;
		}		
		callback(projects);	
	},
	getIssues: function(project, callback) {
		var name = this.webalizeString(project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets/";
		this.restClient.sendRequest(requestURL, "GET", this.parseIssues, callback, project);
	},
	parseIssues: function(xmlDoc, callback, project) {
		var tickets = xmlDoc.getElementsByTagName("ticket");
		var name, description, status, id, milestoneID;
		var issues = new Array();
		var count = tickets.length;
		for(i = 0; i < count; i++) {				
			id = tickets[i].getElementsByTagName("number")[0].childNodes[0].nodeValue;
			name = tickets[i].getElementsByTagName("summary")[0].childNodes[0].nodeValue;
			if (tickets[i].getElementsByTagName("description")[0].childNodes[0] != undefined) {
				description = tickets[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;	
			} else {
				description = "";
			}
			status = tickets[i].getElementsByTagName("status-name")[0].childNodes[0].nodeValue;
			if (tickets[i].getElementsByTagName("milestone-id")[0].childNodes[0] != undefined) {
				milestoneID = tickets[i].getElementsByTagName("milestone-id")[0].childNodes[0].nodeValue;
			} else {
				milestoneID = '';
			}
			issue = new Issue(id, name, description);
			issue.status = status;
			issue.project = project;
			if (milestoneID != '') {
				issue.milestone = new Milestone(milestoneID, '', '', 0);
			}
			issue.labels = new Array();
			issues[i] = issue;
		}
		callback(issues);
	},
	getUsers: function(project, callback) {
		var name = this.webalizeString(project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/users/";
		this.restClient.sendRequest(requestURL, "GET", this.parseUsers, callback, project);
	},
	parseUsers: function(xmlDoc, callback, project) {
		var workers = xmlDoc.getElementsByTagName("user");
		var name, email, id;
		var users = new Array();
		var count = workers.length;
		for(i = 0; i < count; i++) {				
			name = workers[i].getElementsByTagName("login")[0].childNodes[0].nodeValue;
			email = "";
			if (workers[i].getElementsByTagName("email")[0] != undefined)
				email = workers[i].getElementsByTagName("email")[0].childNodes[0].nodeValue;
			id = workers[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
			user = new User(name, email, project);
			user.id = id;
			users[i] = user;
		}
		callback(users, project);
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
		var name = this.webalizeString(issue.project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets";
		
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += "<ticket>";
		//data += "<number>" + issue.id + "</number>";
		data += "<summary>" + issue.title + "</summary>";
		if (issue.description != "") {
			data += "<description>" + issue.description + "</description>";
		} else {
			data += "<description>created from GTD Tool app</description>";			
		}
		data += "<priority>1</priority>";
		if (issue.user != null && issue.user.id != 0)
			data += "<assigned-to-id>" + issue.user.id + "</assigned-to-id>";
		if (issue.milestone != null && issue.milestone.id != 0)
			data += "<milestone-id>" + issue.milestone.id + "</milestone-id>";
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
		
		this.restClient.sendFile(requestURL, "POST", fullContent, boundary, this.confirmNewIssue, callback, issue.issue_id);
	},
	confirmNewIssue: function(xmlDoc, callback, issue_id) {
		var tickets = xmlDoc.getElementsByTagName("ticket");
		var id;
		var count = tickets.length;
		for(i = 0; i < count; i++) {				
			id = tickets[i].getElementsByTagName("number")[0].childNodes[0].nodeValue;
		}
		
		var issue = new Issue(id, "", "");
		issue.issue_id = issue_id;
		
		callback(issue);
	},
	editIssue: function(issue, callback) {
		var name = this.webalizeString(issue.project.getName());
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
		
		this.restClient.sendFile(requestURL, "PUT", fullContent, boundary, this.confirmEditIssue, callback);			
	},
	confirmEditIssue: function(response, callback) {
		var message = "Issue changed";
		callback(message);
	},
	deleteIssue: function(issue, callback) {
		var name = this.webalizeString(issue.project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/tickets/"+issue.id;
		
		this.restClient.sendRequest(requestURL, "DELETE", this.confirmDeleteIssue, callback);		
	},
	confirmDeleteIssue: function(response, callback) {
		var message = "Issue deleted";
		callback(message);
	},
	getMilestones: function(project, callback) {
		var name = this.webalizeString(project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/milestones/";
		
		this.restClient.sendRequest(requestURL, "GET", this.parseMilestones, callback, project);
	},
	parseMilestones: function(xmlDoc, callback, project) {
		var stones = xmlDoc.getElementsByTagName("milestone");
		var title, date, id;
		var milestones = new Array();
		var count = stones.length;
		for(i = 0; i < count; i++) {
			id = stones[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
			title = stones[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			if (stones[i].getElementsByTagName("due-date")[0].childNodes[0] != undefined) {
				date = stones[i].getElementsByTagName("due-date")[0].childNodes[0].nodeValue;
			} else {
				date = '';
			}
			milestone = new Milestone(id, title, date, project.project_id);
			milestones[i] = milestone;
		}
		callback(milestones, project);
	},
	addMilestone: function(milestone, callback) {
		var name = this.webalizeString(milestone.project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/milestones/";
		
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += "<milestone>";
		data += "<title>" + milestone.title + "</title>";
		data += "<due-date>" + milestone.date + "</due-date>";
		data += "</milestone>";
		
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
		
		this.restClient.sendFile(requestURL, "POST", fullContent, boundary, this.confirmNewMilestone, callback);
	},
	confirmNewMilestone: function(response, callback) {
		var message = "Milestone created";
		callback(message);
	},
	editMilestone: function(milestone, callback) {
		var name = this.webalizeString(milestone.project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/milestones/"+milestone.id;
		
		var data = '<?xml version="1.0" encoding="UTF-8" ?>';
		data += "<milestone>";
		data += "<title>" + milestone.title + "</title>";
		data += "<due-date>" + milestone.date + "</due-date>";
		data += "</milestone>";
		
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
		
		this.restClient.sendFile(requestURL, "PUT", fullContent, boundary, this.confirmEditMilestone, callback);
	},
	confirmEditMilestone: function(response, callback) {
		var message = "Milestone changed";
		callback(message);
	},
	deleteMilestone: function(milestone, callback) {
		var name = this.webalizeString(milestone.project.getName());
		var requestURL = "http://www.assembla.com/spaces/"+name+"/milestones/"+milestone.id;
		
		this.restClient.sendRequest(requestURL, "DELETE", this.confirmDeleteMilestone, callback);
	},
	confirmDeleteMilestone: function(response, callback) {
		var message = "Milestone deleted";
		callback(message);
	},
	editProject: function(project, callback) {
		var message = "Assembla nepodporuje editaci projektu";
		callback(message);
	}
});