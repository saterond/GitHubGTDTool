/**
 * Trida predstavujici jeden zakladni projekt (bez vazby na verzovaci system)
 * 
 * @author Ondrej Satera
 */
var Project = Class.create({
	name: "",
	description: "",
	initialize: function(_name, _description) {
		this.name = _name;
		this.description = _description;
	},
	getName: function() {
		return this.name;
	},
	getDescription: function() {
		return this.description;
	},
	setName: function(_name) {
		this.name = _name;
	},
	setDescription: function(_description) {
		this.description = _description;
	}
});

/**
 * Trida predstavujici jeden ukol/issue
 * 
 * @author Ondrej Satera
 */
var Issue = Class.create({
	id: 0,
	title: "",
	description: "",
	labels: [],
	dueDate: "",
	status: "",
	project: "",
	initialize: function(_id, _title, _description) {
		this.id = _id;
		this.title = _title;
		this.description = _description;
		this.labels = [];
	}
});

/**
 * Trida predstavujici jednoho uzivatele/spolupracovnika
 * 
 * @author Ondrej Satera
 */
var User = Class.create({
	id: 0,
	name: "",
	email: "",
	project: "",
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
	title: "",
	date: "",
	project: "",
	initialize: function(_id, _title, _date, _project) {
		this.id = _id;
		this.title = _title;
		this.date = _date;
		this.project = _project; 
	}
});
