Event.observe(window, 'load', function() {

});

var handlerShowIssueInfo = document.on('click', 'button[class~="showInfo"]', function(event, element) {
		var key = element.readAttribute('data-key');
		element.toggleClassName("up");
		var div = $("info_"+key);
		div.toggleClassName("hidden");
    }.bind(this)
);
handlerShowIssueInfo.stop();
handlerShowIssueInfo.start();