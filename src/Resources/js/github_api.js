function GitHubAPI(){}

GitHubAPI.Authenticate = function(username, password, callback) {
	requestURL = "https://api.github.com";
	/*$.getJSON(requestURL, {
		username: username,
		password: password
	}, function(response) {
		callback(response);
	});*/
	$.ajax({		
		url: requestURL,
		username: username,
		password: password,
		dataType: "jsonp",		
		success: function(response) {
			callback(response);
		}  
	});
}
			
GitHubAPI.Repos = function(username, callback){
	requestURL = "https://api.github.com/users/" + username + "/repos?callback=?";
	$.ajax({
		url: requestURL,
		dataType: "jsonp",
		success: function(response) {
			callback(response);						
		}					 
	});
}

GitHubAPI.MyIssues = function(username, callback){
	requestURL = "https://api.github.com/issues?callback=?";
	$.ajax({
		url: requestURL,
		dataType: "jsonp",
		success: function(response) {
			callback(response);						
		}					 
	});
}

GitHubAPI.Issues = function(username, repo, callback){
	requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/issues?callback=?";
	$.ajax({
		url: requestURL,
		dataType: "jsonp",
		success: function(response) {
			console.log(response);
			callback(response);						
		}					 
	});
}

GitHubAPI.ProjectIssues = function(username, repo, callback){
	requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/issues";
	$.ajax({
		url: requestURL,
		dataType: "jsonp",
		data: "asignee=none&callback=?",
		success: function(response) {
			console.log(response);
			callback(response);						
		}					 
	});
}

GitHubAPI.ProjectUsers = function(username, repo, callback) {
	requestURL = "https://api.github.com/repos/" + username + "/" + repo + "/collaborators";
	console.log("URL: " + requestURL);
	$.ajax({
		url: requestURL,
		dataType: "jsonp",
		data: "callback=?",
		success: function(response) {
			console.log(response);
			callback(response);						
		}					 
	});
}

$(".authenticate").click(function() {				
	var username = $("#username").val();
	var password = $("#password").val();
	if (username == '' || password == '') {
		alert('Musite vyplnit udaje');
		return;
	}
	$(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader">');
	GitHubAPI.Authenticate(username, password, function(json){					
		console.log(json);
		$("img.loader").remove();
	});	
});

$(".loadRepos").click(function() {
	var username = $("#username").val();
	if (username == '') {
		alert('Musite vyplnit jmeno');
		return;
	}
	$(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader">');
	GitHubAPI.Repos(username, function(json){					
		var content = "";					
		$.each(json.data, function(i){
			projectName = json.data[i].name;
			content += "<li class=\"project\">" + projectName + " - ";
			content += '<button class="loadIssues" data-key="'+projectName+'">load my issues</button>';
			content += '<button class="loadProjectIssues" data-key="'+projectName+'">load all issues</button>';
			content += '<button class="loadProjectUsers" data-key="'+projectName+'">load all collaborators</button>';
			content += '</li>';
		});
		$("ul#projects").empty();
		$("ul#issues").empty();
		$("ul#projects").html(content);
		$("img.loader").remove();
	});					
});

$(".loadIssues").live('click', function() {		
	$(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader">');
	var name = $(this).attr("data-key");
	var username = $("#username").val();
	GitHubAPI.Issues(username, name, function(json) {
		var content = "";
		if (json.meta.status == "404") {
			content = "<li class=\"issue\">nemate zadne issues pridelene</li>";						
		} else {
			$.each(json.data, function(i){
				issueTitle = json.data[i].title;
				content += "<li class=\"issue\">" + issueTitle;
				content += '</li>';
			});
		}
		$("ul#issues").empty();
		$("ul#issues").html(content);
		$("img.loader").remove();
	});
});

$(".loadProjectIssues").live('click', function() {		
	$(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader-issues">');
	var name = $(this).attr("data-key");
	var username = $("#username").val();
	GitHubAPI.ProjectIssues(username, name, function(json) {
		var content = "";
		if (json.meta.status == "404") {
			content = "<li class=\"issue\">projekt nema zadne issues</li>";						
		} else {
			if (json.data.length == 0) {
				content = "<li class=\"user\">projekt nema zadne spolupracovniky</li>";
			} else {
				$.each(json.data, function(i){
					issueTitle = json.data[i].title;
					content += "<li class=\"issue\">" + issueTitle;
					content += '</li>';
				});
			}
		}
		$("ul#issues").empty();
		$("ul#issues").html(content);
		$("img.loader-issues").remove();
	});
});			

$(".loadProjectUsers").live('click', function() {
	$(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader-user">');
	var name = $(this).attr("data-key");
	var username = $("#username").val();
	GitHubAPI.ProjectUsers(username, name, function(json) {
		var content = "";
		if (json.meta.status == "404") {
			content = "<li class=\"user\">projekt nema zadne spolupracovniky</li>";						
		} else {
			if (json.data.length == 0) {
				content = "<li class=\"user\">projekt nema zadne spolupracovniky</li>";
			} else {
				$.each(json.data, function(i){
					userLogin = json.data[i].login;
					avatar = json.data[i].avatar_url;
					content += "<li class=\"user\">";
					content += userLogin;
					content += ', avatar URL: ' + avatar;							
					content += '</li>';
				});
			}
		}
		$("ul#users").empty();
		$("ul#users").html(content);
		$("img.loader-user").remove();
	});
});

$(".myIssues").click(function() {
	var username = $("#username").val();
	if (username == '') {
		alert('Musite vyplnit jmeno');
		return;
	}
	$(this).after('<img src="images/ajax-loader.gif" height="16" width="16" class="loader">');
	GitHubAPI.MyIssues(username, function(json){					
		var content = "";					
		$.each(json.data, function(i){
			console.log(json.data);
			issueTitle = json.data[i].title;
			content += "<li class=\"issue\">" + issueTitle + " - ";
			content += '</li>';
		});					
		$("ul#issues").empty();
		$("ul#issues").html(content);
		$("img.loader").remove();
	});	
});
