/**
 * @author saterond
 */
function handleSelectProject(event, element) {
	var key = element.readAttribute("data-key");
	var parts = key.split('*');
	
	var viewer = Titanium.API.get("viewer");
	viewer.reloadIssues(parts[2]);
}