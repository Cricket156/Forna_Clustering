document.getElementById('file').addEventListener('change', loadCSV, false);
window.addEventListener('resize', doAll);

var results = [];		//2d array, that holds all nodes
var clusters = [];		//3d array; 1st D: cluster, 2nd D: single node, 3rd D: node info
var columnnames = [];
var matrixloaded = false;
var matrixfilter = -1;
var heatmapfilteri = -1;
var heatmapfilterj = -1;
//reads the csv File from the input to the results array
function loadCSV(evt) {
	results = [];
	clusters = [];
	columnnames = [];
	matrixloaded = false;
	matrixfilter = -1;
	heatmapfilteri = -1;
	heatmapfilterj = -1;

	var file = evt.target.files[0];
	if (file) {
		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(e) {
			var csv = e.target.result;
			var allTextLines = csv.split(/\r\n|\n/);

			var line1 = allTextLines[0].split(',');
			for (var j=0; j<line1.length; j++) {
				columnnames.push(line1[j]);
			}
                                
			for (var i=1; i<allTextLines.length-1; i++) {
				var data = allTextLines[i].split(',');
					var line = [];
					for (var j=0; j<data.length; j++) {
						line.push(parseFloat(data[j]));
					}
					results.push(line);
			}

	//TODO vorlaeufige Festlegung der Groesse des svgs
	d3.select("#matrix")
		.attr("width",500)
		.attr("height",500);

	d3.select("#parallelCoordinates")
		.attr("width", 300)
		.attr("height", 400);
		
	d3.select("barchart")
		.attr("width", 800)
		.attr("height", 200);
		
//TODO: nur eine Übergangslösung, sollte eine bessere Stelle zum Aufruf gefunden werden..
			initDropdown();
			extractClusters();
			doAll();
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

function initDropdown() {
	var dropdown_x=d3.select("#filterxaxis");
	var dropdown_y=d3.select("#filteryaxis");

	dropdown_x.append("option")
		.attr("value",-1)
		.text("no selection");
		
	dropdown_y.append("option")
		.attr("value",-1)
		.text("no selection");
	
        for(var i=5;i<columnnames.length-1;++i)
        {
                dropdown_x.append("option")
                        .attr("value",i)
                        .text(columnnames[i]);
		dropdown_x.on("change",function(d) {
				var index = dropdown_x.property("selectedIndex"),
                                s = dropdown_x.selectAll("option").filter(function (d, i) { return i === index });
                                heatmapfilteri  = s.attr("value");
                                doMatrix();
			});

		dropdown_y.append("option")
                        .attr("value",i)
                        .text(columnnames[i]);
                dropdown_y.on("change",function(d) {
				var index = dropdown_y.property("selectedIndex"),
			        s = dropdown_y.selectAll("option").filter(function (d, i) { return i === index });
        			heatmapfilterj = s.attr("value");
                                doMatrix();
                        });
        }
		
		for(var i=2;i<5;++i)
		dropdown_y.append("option")
				.attr("value",i)
                .text(columnnames[i]);
}

function doAll() {
	d3.select("#barchart").selectAll("*").remove();
	d3.select("#parallelCoordinates").selectAll("*").remove();
	d3.select("#matrix").selectAll("*").remove();
	
	doBarchart();
	doParallelCoordinates();
	doMatrix();
}