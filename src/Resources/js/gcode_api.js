jQuery.noConflict();

function GCodeAPI(){}

GCodeAPI.Authenticate = function(callback) {
	var requestURL = "https://www.google.com/accounts/ClientLogin";
	var dataToSend = "?accountType=GOOGLE&Email=ondrej.satera@gmail.com&Passwd=2abc5jkl&service=code&source=ctuFee-gtdDeveloperTasks-0";
	client = Titanium.Network.createHTTPClient();
		
	client.onerror = function() {
		Titanium.API.info("error");
	}
	if (!client.open("POST", requestURL + dataToSend, true)) {
		Titanium.API.info("spojeni se nepodarilo");
	} else {
		client.receive(function(response) {
			text = response.toString();
			lines = text.split('\n');
			callback(lines[2]);
		});
	}
}

GCodeAPI.Issues = function(auth, project, callback) {
	var requestURL = "https://code.google.com/feeds/issues/p/"+project+"/issues/full";
	client = Titanium.Network.createHTTPClient();
		
	client.onerror = function() {
		Titanium.API.info("error");
	}
	if (!client.open("GET", requestURL, true)) {
		Titanium.API.info("spojeni se nepodarilo");
	} else {
		client.setRequestHeader('Authorization', 'GoogleLogin '+auth);
		
		client.receive(function(response) {
			var xmlText = response.toString();
			var parser = new DOMParser();
		  	var xmlDoc = parser.parseFromString(xmlText,"text/xml");
			var entries = xmlDoc.getElementsByTagName("entry");
			callback(entries);
		});
	}
}
