document.getElementById('file').addEventListener('change', loadCSV, false);
window.addEventListener('resize', doAll);

var results = [];		//2d array, that holds all nodes
var clusters = [];		//3d array; 1st D: cluster, 2nd D: single node, 3rd D: node info
var columnnames = [];
var gewichtungen = [1,1,1];
var matrixloaded = false;
var matrixfilter = -1;
var heatmapfilteri = -1;
var heatmapfilterj = -1;

var barchartHover = true;
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
			initOptions();
			extractClusters();
			randomColorGenerator();
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
	
	var getAvgPenalty = function(d) {
		var result=0;
		for(var i=0;i<gewichtungen.length;++i)
			result+=gewichtungen[i]*d[2+i];
		return result;
	}
	
	clusters = clusters.sort(function(a, b) {
			var a_avg = [];
			a_avg.push(0);
			a_avg.push(0);
			var b_avg = [];
			b_avg.push(0);
			b_avg.push(0);
			for(var i=0;i<3;++i)
			{
				a_avg.push(d3.mean(a,function(d) {
						return parseFloat(d[2+i]);
					}));
				b_avg.push(d3.mean(b,function(d) {
						return parseFloat(d[2+i]);
					}));
			}
			
			return getAvgPenalty(a_avg) - getAvgPenalty(b_avg);
		});
	
	/*var counter = 0;
	var len = 0;
	// average cluster results
	var cluster_penaltyarray = [];
	var clusterlengtharray = [];
	var totalposition = 0;
	var totaloverlap = 0;
	var totalstretches = 0;
	var previous = 0;
	var current = 0;
	var globavg =0;
	var globalsum = 0;
	var avgpercluster = [];
	var gobalavgarr = [];

	// produce array with only penalties
	clusters.forEach(function(d) {
		// fore each node d in cluster
		len = +d.length;
		clusterlengtharray.push(len);
		d.forEach(function(e){
			// adds numcluster, overlaps, stretches, position
			cluster_penaltyarray.push([+e[1], +e[2], +e[3], +e[4], len]);
			 })
			  });
		// // gets average for each cluster penalties
		// TODO: da ist irgendwo ein minifehler drinnen und bei den totaloverlaps wird irgendwo eins
		// dazugezaehlt
		// average penalties per cluster
			// mean = d3.mean(selectedData,function(d) { return +d.reading})
				cluster_penaltyarray.forEach(function(e){
					current = e[0];
					if (current == previous){
						totaloverlap += e[1];
						totalstretches += e[2];
						totalposition += e[3];

					}
					else{
						totaloverlap += e[1];
						totalstretches += e[2];
						totalposition += e[3];
						len = +e[4];
						avgpercluster.push([totaloverlap/len, totalstretches/len, totalposition/len]);
						totaloverlap = 0;
						totalstretches = 0;
						totalposition = 0;

					}
					previous = current;

			});*/
	//console.log(avgpercluster)
	// now average over all averages of clusters (global average)
	//TODO: pushing global average into array doesn't work for reasons I can't understand
	// avgpercluster.forEach(function(d){
	//  globavg = ((+d[0] + +d[1] + +d[2])/cluster_count);
	//  console.log(globavg);
	//  // globalavgarr.push(globavg);
	// });
	//
	//  console.log(globalavgarr);
}

function initOptions() {
	var dropdown_x=d3.select("#filterxaxis");
	var dropdown_y=d3.select("#filteryaxis");

	dropdown_x.append("option")
		.attr("value",-1)
		.text("no selection");
		
	dropdown_y.append("option")
		.attr("value",-1)
		.text("no selection");
	
	//Fuer alle Parameter
	for(var i=5;i<columnnames.length-1;++i)
	{
		dropdown_x.append("option")
			.attr("value",i)
			.text(columnnames[i]);
		dropdown_x.on("change",function(d) {
				var index = d3.select(this).property("selectedIndex");
				s = d3.select(this).selectAll("option").filter(function (d, i) { return i === index });
				heatmapfilteri  = s.attr("value");
				doMatrix();
			});

		dropdown_y.append("option")
			.attr("value",i)
			.text(columnnames[i]);
		dropdown_y.on("change",function(d) {
				var index = d3.select(this).property("selectedIndex");
				s = d3.select(this).selectAll("option").filter(function (d, i) { return i === index });
				heatmapfilterj = s.attr("value");
				doMatrix();
			});
	}
	
	//Fuer alle Penalties
	for(var i=2;i<5;++i)
	{
		dropdown_y.append("option")
			.attr("value",i)
			.text(columnnames[i]);
			
		var txtGewichtungen = d3.select("#gewichtungen");
		txtGewichtungen.append("br");
		txtGewichtungen.append("input")
			.attr("class", i)
			.attr("type","number")
			.attr("min",0)
			.attr("max",1)
			.attr("step",0.1)
			.attr("value",1)
			.on("input",function(d) {
					s = this.value;
					id = parseInt(d3.select(this).attr("class"))-2;
					console.log(id);
					gewichtungen[id]=parseFloat(s);
					doBarchart();
					doMatrix();
					console.log(gewichtungen);
				});
	}
	
	
}

function doAll() {
	d3.select("#barchart").selectAll("*").remove();
	d3.select("#parallelCoordinates").selectAll("*").remove();
	d3.select("#matrix").select("g").selectAll("g").selectAll("*").remove();
	
	doBarchart();
	doParallelCoordinates();
	doMatrix();
}

function showSVG(d, svg_direct) {
	var group = svg_direct.append("g").attr("class","vis");

	group.append("rect")
		.attr("class","details")
		.attr("x",0)
		.attr("y",0)
		.attr("width",400)
		.attr("height",300)
		.attr("fill","khaki");
		
	var group_new_window = group.append("g").attr("class","new_window");
		
	group_new_window.append("rect")
		.attr("class","vis_rect")
		.attr("x",10)
		.attr("y",10)
		.attr("width",200)
		.attr("height",280)
		.attr("fill","white")
		.on("click",function(d) {
			window.open("./svg1.svg");
		});
		
	try {
		d3.xml("svg1.svg", "image/svg+xml", function(error, xml) {
				if (error) throw error;

				var svgNode = xml.getElementsByTagName("svg")[0];
				svg_direct.node().appendChild(svgNode);
				svg_direct.select("#plotting-area").select("g")
					.attr("transform","scale(0.5,0.5)")
					.on("click",function(d) {
						window.open("./svg1.svg");
					});
				});
	}
	catch(err)
	{
		group.append("text")
		.attr("x",20)
		.attr("y",50)
		.text("Konnete nicht gezeichnet werden");
	}

	var group_close = group.append("g").attr("class","close");

	group_close.append('image')
		.attr('xlink:href','close.jpg')
		.attr('height', 20)
		.attr('width', 20)
		.on("click",function(d) {
			svg_direct.select("#plotting-area").remove();
			svg_direct.selectAll(".vis").remove();
		});

	group_close.attr("transform","translate(370,7)");

	group.append("text")
		.attr("x",250)
		.attr("y",50)
		.text("Overlaps: " + d[2]);

	group.append("text")
		.attr("x",250)
		.attr("y",65)
		.text("Stretches: " + d[3]);

	group.append("text")
		.attr("x",250)
		.attr("y",80)
		.text("Position: " + d[4]);

	group.append("text")
		.attr("x",250)
		.attr("y",95)
		.text("Cluster: " + d[1]);

	group.append("text")
		.attr("x",250)
		.attr("y",120)
		.text("parameter1: " + d[5]);

	group.append("text")
		.attr("x",250)
		.attr("y",135)
		.text("parameter2: " + d[6]);

	group.append("text")
		.attr("x",250)
		.attr("y",150)
		.text("parameter3: " + d[7]);

	group.append("text")
		.attr("x",250)
		.attr("y",180)
		.text("Nummer: " + d[0]);

	d3.event.stopPropagation();
}