/**
 * Trida predstavujici jeden zakladni projekt (bez vazby na verzovaci system)
 * 
 * @author Ondrej Satera
 */
var Project = Class.create({
	project_id: 0, 
	name: "",
	description: "",
	type: 0,
	state: 1,
	labels: null,
	old_name: "", //pouziva se pri editaci projektu
	initialize: function(_name, _description) {
		this.name = _name;
		this.description = _description;
		this.state = 1;
		this.labels = new Array();
	},
	getName: function() {
		return this.name;
	},
	setName: function(_name) {
		this.name = _name;
	},
	getDescription: function() {
		return this.description;
	},
	setDescription: function(_description) {
		this.description = _description;
	}
});

var AssemblaProject = Class.create(Project, {
	type: 1
});

var GCodeProject = Class.create(Project, {
	type: 2
});

var GitHubProject = Class.create(Project, {
	type: 3
});

/**
 * Trida predstavujici jeden ukol/issue
 * 
 * @author Ondrej Satera
 */
var Issue = Class.create({
	id: 0,
	issue_id: 0,
	title: "",
	description: "",
	labels: null,
	dueDate: "",
	status: "",
	project: null,
	state: 1,
	milestone: null,
	project_type: 0,
	archived: false,
	inbox: false,
	user: null,
	initialize: function(_id, _title, _description) {
		this.id = _id;
		this.title = _title;
		this.description = _description;
		this.labels = null;
		this.state = 1;
	}
});

/**
 * Trida predstavujici jednoho uzivatele/spolupracovnika
 * 
 * @author Ondrej Satera
 */
var User = Class.create({
	user_id: 0,
	id: 0,
	name: "",
	email: "",
	project: null,
	initialize: function(_name, _email, _project) {
		this.name = _name;
		this.email = _email;
		this.project = _project;
	}
});

/**
 * Trida predstavujici jeden milnik/milestone
 * 
 * @author Ondrej Satera
 */
var Milestone = Class.create({
	id: 0,
	milestone_id: 0,
	project_id: 0,
	title: "",
	date: "",	
	initialize: function(_id, _title, _date, _project_id) {
		this.id = _id;
		this.title = _title;
		this.date = _date;
		this.project_id = _project_id; 
	}
});

var Label = Class.create({
	label_id: 0,
	text: "",
	text2: "",
	local: true,
	issue_id: 0,
	project_id: 0,
	initialize: function(_label_id, _issue_id, _text) {
		this.label_id = _label_id;
		this.text = _text;
		this.issue_id = _issue_id;
	}
});
