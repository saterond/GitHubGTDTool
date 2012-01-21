jQuery.noConflict();

function AssemblaAPI(){}

AssemblaAPI.Spaces = function(callback) {
	var requestURL = "https://www.assembla.com/spaces/my_spaces";
	client = Titanium.Network.createHTTPClient();
	
	client.onload = function() {
		callback(this.responseText);
	}
	client.onreadystatechange = function() {
		console.log(this.status + ": " + this.statusText);
	}
	client.onerror = function() {
		Titanium.API.info("error");
	}
	if (!client.open("GET", requestURL, true)) {
		Titanium.API.info("spojeni se nepodarilo");
	} else {
		authstr = "Basic " + Titanium.Codec.encodeBase64("p4nther:bubenec");
    	client.setRequestHeader("Authorization", authstr);
    	client.setRequestHeader("Accept", "application/xml");    	
    	
    	client.send(); 
	}
}
