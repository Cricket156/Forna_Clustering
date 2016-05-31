// TODO: small change in the initial selection, all others
// show the right parameter selection, then also maybe remove
// options that have already been chosen

document.getElementById('file').addEventListener('change', loadCSV, false);
//file handler
var headervalues = [];
var columnnames = [];
function loadCSV(evt) {
	var file = evt.target.files[0];
	if (file) {
		var reader = new FileReader();
		reader.readAsText(file);
    // get column header of csv file
		reader.onload = function(e) {
      var lines=e.target.result.split("\n");
      headervalues=lines[0].split(";");
      for(var i=0;i<headervalues.length;i++){
      var temp={Parameter: headervalues[i]};
      columnnames.push(temp);
      // Non-editable catalog data - would come from the header of the penalties file
}
// needs to be called because data needs to be loaded
ParameterViewModel();
}
}
}
// Overall viewmodel for this screen, along with initial state
function ParameterChoice(initialParameter) {
    var self = this;
    // self.ParamName = ParamName;
    self.Parameter = ko.observable(initialParameter);
}

// Overall viewmodel for this screen, along with initial state
function ParameterViewModel() {
    var self = this;
    // Non-editable catalog data - would come from the server
    self.availableParameters = columnnames;
    console.log(self.availableParameters);
    // Editable data
    self.Parameter = ko.observableArray([
        new ParameterChoice(self.availableParameters[0]),
        // new ParameterChoice(self.availableParameters[1])
    ]);

    // Operations
    self.addParameter = function() {
        self.Parameter.push(new ParameterChoice(self.availableParameters[0]));
    }
    self.removeParameter = function(Parameter) { self.Parameter.remove(Parameter) }
}

ko.applyBindings(new ParameterViewModel());
