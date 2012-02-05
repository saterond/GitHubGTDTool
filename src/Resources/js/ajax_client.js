/**
 * @author Ondrej Satera
 */
var Ajax_client = Class.create({
	username: "",
	auth: "",
	initialize: function(_username, _auth) {
		this.username = _username;
		this.auth = _auth;
	},
	sendRequest: function(_requestURL, _method, callback, returnFunction, project) {
		var client = Titanium.Network.createHTTPClient();
		
		client.onload = function() {
			var response = this.responseText;
			var json = Titanium.JSON.parse(response);
			callback(json, returnFunction, project);
		}
		client.onreadystatechange = function() {
			Titanium.API.info(this.status + ": " + this.statusText);
		}
		client.onerror = function() {
			Titanium.API.error("Error " + this.status + ": " + this.statusText);
		}
		if (!client.open(_method, _requestURL, true)) {
			Titanium.API.error("Connection with server failed");
		} else {			
			client.send(); 
		}	
	},
	sendData: function(_requestURL, _method, _data, callback, returnFunction) {
		client = Titanium.Network.createHTTPClient();
		client.onload = function() {
			var response = this.responseText;
			var json = Titanium.JSON.parse(response);
			callback(json, returnFunction);
		}
		client.onerror = function() {
			Titanium.API.info("error");
		}
		client.onreadystatechange = function() {
			Titanium.API.info(this.status + ": " + this.statusText);
		}
		if (!client.open(_method, _requestURL, true)) {
			Titanium.API.info("spojeni se nepodarilo");
		}
		client.setRequestHeader('Authorization', this.auth);
		if (!client.send(_data)) {
			Titanium.API.info("data nebyla odeslana");
		}
	}
});