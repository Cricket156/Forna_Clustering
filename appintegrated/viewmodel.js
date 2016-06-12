// This is a knockoutjs flexible user interface to provide parameters for clustering

// custom ajax call
ajax = function(uri, method, data, timeout) {
  var request = {
    url: "http://localhost:5000" + uri,
    timeout: timeout,
    type: method,
    contentType: "application/json",
    accepts: "application/json",
    cache: false,
    dataType: 'json',
    data: data,
    error: function(jqXHR) {
         window.location.replace("http://localhost:5000/userinterface.html")
        console.log("ajax error " + jqXHR.status + jqXHR.responseText);
    }
  };
  return $.ajax(request);
};


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
    }
// needs to be called because data needs to be loaded
ParameterViewModel();
}
}
}
// Overall viewmodel for this screen, along with initial state
function ParameterChoice(initialParameter) {
    var self = this;
    self.Parameter = ko.observable(initialParameter);
}

// Overall viewmodel for this screen, along with initial state
function ParameterViewModel() {
    var self = this;
    self.newParamText = ko.observable();
		 // non editable options
    self.availableParameters = columnnames;
    self.Parameter = ko.observableArray();

    // Operations
    self.addParameter = function() {
        self.Parameter.push(new ParameterChoice(self.availableParameters[0]));
        }
				self.sendMe = function(){

					var datasubmit = ko.toJSON(self.Parameter());
				
						ajax('/input', 'POST', JSON.stringify(datasubmit), 1000000000).success(
							function(data) {
                       window.location.replace("http://localhost:5000/index.html")
            // after clustering data contains thre result
          });

	 			 			};

		self.removeParameter = function(Parameter) { self.Parameter.remove(Parameter) }


};



ko.applyBindings(new ParameterViewModel());
