var GTDClient = Class.create({
	serverURL: "",
	method: "",
	timeout: 1000,
	initialize: function(options) {
		this.serverURL = options.serverURL;
		this.method = options.method;
		this.timeout = options.timeout;
	},
	call: function(params) {
		var client = Titanium.Network.createHTTPClient(),
			result = null;
		
		client.setTimeout(this.timeout);
		
		client.onerror = function(e) {				
			Titanium.API.info('HTTP error: ' + e);
		};

		if (client.open(this.method, this.serverURL, false)) {			
			client.receive(function(response) {
				result = response.toString();
			}, params);
		} else {
			Titanium.API.info('cannot open connection');
            result = false;
		}	

		return result;
	}
});
