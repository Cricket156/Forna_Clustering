document.getElementById('file').addEventListener('change', loadCSV, false);

var results = [];		//2d array, that holds all nodes
var clusters = [];		//3d array; 1st D: cluster, 2nd D: single node, 3rd D: node info
var matrixloaded = false;
var matrixfilter = -1;
var heatmapfilteri = -1;
var heatmapfilterj = -1;
//reads the csv File from the input to the results array
function loadCSV(evt) {
	var file = evt.target.files[0];
	if (file) {
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(e) {
			var csv = e.target.result;
			var allTextLines = csv.split(/\r\n|\n/);

			for (var i=1; i<allTextLines.length-1; i++) {
				var data = allTextLines[i].split(',');
					var line = [];
					for (var j=0; j<data.length; j++) {
						line.push(parseFloat(data[j]));
					}
					results.push(line);

			}

	//TODO vorlaeufige Festlegung der Groesse des svgs
	var svg = d3.select("#matrix");
	svg.attr("width",500)
		.attr("height",500);
		

//TODO: nur eine Übergangslösung, sollte eine bessere Stelle zum Aufruf gefunden werden..
			extractClusters();
			doBarchart();
			doParallelCoordinates();
			doMatrix();
		}
	}
	else { 
		alert("Failed to load file");
	}
}

//extracts the clusters from the results Array
function extractClusters() {
	var aktuellerCluster = results[0][1];
	var cluster = [];
	for (var i = 0; i < results.length; i++) {
		if (results[i][1] != aktuellerCluster) {
			aktuellerCluster = results[i][1];
			clusters.push(cluster);
			cluster = [];
		}
		if (results[i][1] == aktuellerCluster) {
			cluster.push(results[i]);
		}
	}
}
