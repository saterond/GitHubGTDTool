/**
 * @author Ondrej Satera
 */
var RestClient = Class.create({
	username: "",
	password: "",	
	auth: "",
	initialize: function(_username, _password) {
		this.username = _username;
		this.password = _password;		
	},
	setAuth: function(_auth) {
		this.auth = _auth;
	},
	sendRequest: function(_url, _method, callback, returnFunction) {
		var requestURL = _url;
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var xmlText = this.responseText;			
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
		  	callback(xmlDoc, returnFunction);
		}
		client.onreadystatechange = function() {
			Titanium.API.info(this.status + ": " + this.statusText);
		}
		client.onerror = function() {
			Titanium.API.error("Error " + this.status + ": " + this.statusText);
		}
		if (!client.open(_method, requestURL, true)) {
			Titanium.API.error("Connection with server failed");
		} else {			
			if (this.auth != "") {
				//vola se Google Code API
				client.setRequestHeader("Authorization", this.auth);
			} else {
				//vola se Assembla API
				authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
		    	client.setRequestHeader("Authorization", authstr);	    	
		    	client.setRequestHeader("Accept", "application/xml");
	    	}
	    	
	    	client.send(); 
		}
	},
	sendFile: function(_url, _method, _data, _boundary, callback, returnFunction) {
		var requestURL = _url;
		client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var xmlText = this.responseText;
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
		  	callback(xmlDoc, returnFunction);			
		}
		client.onreadystatechange = function() {
			Titanium.API.info(this.status + ": " + this.statusText);
		}
		client.onerror = function() {
			Titanium.API.error("Error " + this.status + ": " + this.statusText);
		}
		if (!client.open(_method, requestURL, true)) {
			Titanium.API.error("Connection with server failed");
		} else {
			if (this.auth != "") {
				//vola se Google Code API
				client.setRequestHeader("Authorization", this.auth);
		    
		    	client.setRequestHeader("Content-type", "application/atom+xml");
				client.setRequestHeader("Connection", "close");
				client.send(_data);
			} else {
				//vola se Assembla API
				authstr = "Basic " + Titanium.Codec.encodeBase64(this.username + ":" + this.password);
		    	client.setRequestHeader("Authorization", authstr);
		    	client.setRequestHeader("Accept", "application/xml");    	
		    
		    	client.setRequestHeader("Content-type", "application/xml; boundary=\"" + _boundary + "\"");
				client.setRequestHeader("Connection", "close");
				client.send(_data);
	    	}
					    	
		}
	}
});
