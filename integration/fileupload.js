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
      var temp={parameterName: headervalues[i]};
      columnnames.push(temp);

      // Non-editable catalog data - would come from the header of the penalties file
}
}
}
}
console.log(columnnames);
