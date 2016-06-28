document.getElementById('file').addEventListener('change', loadCSV, false);
window.addEventListener('resize', doAll);

var original_results = [];
var results = [];		//2d array, that holds all nodes
var clusters = [];		//3d array; 1st D: cluster, 2nd D: single node, 3rd D: node info
var columnnames = [];
var gewichtungen = [];
var matrixloaded = false;
var matrixfilter = -1;
var heatmapfilteri = -1;
var heatmapfilterj = -1;
var anzahlPenalties = 0;
var barchartHover = true;
var svgPfad = "";
var drawSVG = true;

var colors = [];
var heatmapcolors = ["green","red"];	//good, bad Visualization
var barchartoption = 0;

//reads the csv File from the input to the results array
function loadCSV(evt) {
	results = [];
	original_results = [];
	clusters = [];
	columnnames = [];
	matrixloaded = false;
	matrixfilter = -1;
	heatmapfilteri = -1;
	heatmapfilterj = -1;

	d3.selectAll("#loaddata").remove();

	d3.selectAll(".hiddenThings").style("visibility","visible");

	colors.push("#4F81BC");
	colors.push("#C24F4C");
	colors.push("#9BBA5C");

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
					original_results.push(line);
			}

			anzahlPenalties = parseInt(prompt("Please enter the Number of Penalties"));
			svgPfad = prompt("Please enter the full path to the SVG files. \nIf you don't want to show the SVG's, just enter 'NO'");

			if (svgPfad == "NO" || svgPfad == "N" || svgPfad == "n" || svgPfad == "no") {
				drawSVG = false;
			}

			/*else {
				window.open("file:///" + svgPfad);
			}*/

			for(var i=0;i<anzahlPenalties;++i)
				gewichtungen.push(1);

			initOptions();
			extractClusters();
			randomColorGenerator();
			doAll();

			d3.select("#sliders").selectAll("*").remove();
			doSliders();
		}
	}
	else {
		alert("Failed to load file");
	}
}

//extracts the clusters from the results Array
function extractClusters() {
	clusters = [];
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
			for(var i=0;i<anzahlPenalties;++i)
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
	for(var i=anzahlPenalties+2;i<columnnames.length-1;++i)
	{
		dropdown_x.append("option")
			.attr("value",i)
			.text(columnnames[i]);

		dropdown_y.append("option")
			.attr("value",i)
			.text(columnnames[i]);
	}

	//Fuer alle Penalties
	for(var i=2;i<anzahlPenalties+2;++i)
	{
		dropdown_y.append("option")
			.attr("value",i)
			.text(columnnames[i]);

		var txtGewichtungen = d3.select("#gewichtungen");
		txtGewichtungen.append("br");
		txtGewichtungen.append("input")
			.attr("class", i)
			.attr("type","number")
			.attr("step",0.1)
			.attr("value",1)
			.attr("title", function() {
				return columnnames[i];
			})
			.on("input",function(d) {
					s = this.value;
					id = parseInt(d3.select(this).attr("class"))-2;
					console.log(id);
					gewichtungen[id]=parseFloat(s);
					extractClusters();
					doAll();
				});

		d3.select("#barchartoptions").append("option")
			.attr("value",i)
			.text(columnnames[i]);
	}

	dropdown_y.append("option")
			.attr("value",-2)
			.text("SumPenalties");

	dropdown_x.on("change",function(d) {
			var index = d3.select(this).property("selectedIndex");
			s = d3.select(this).selectAll("option").filter(function (d, i) { return i === index });
			heatmapfilteri = parseInt(s.attr("value"));

			if(-1==heatmapfilteri)
				d3.select("#matrix").selectAll(".axis").style("font","10px sans-serif");

			doMatrix();
		});

	dropdown_y.on("change",function(d) {
			var index = d3.select(this).property("selectedIndex");
			s = d3.select(this).selectAll("option").filter(function (d, i) { return i === index });
			heatmapfilterj = parseInt(s.attr("value"));

			if(-1==heatmapfilterj)
				d3.select("#matrix").selectAll(".axis").style("font","10px sans-serif");

			doMatrix();
		});

	d3.select("#heatmapcolors").on("change",function(d) {
			var index = d3.select(this).property("selectedIndex");
			s = d3.select(this).selectAll("option").filter(function (d, i) { return i === index });
			var value = s.attr("value");

			if(0==value)
				heatmapcolors=["green","red"];
			else if(1==value)
				heatmapcolors=["#FFD500","#4102FF"];
			else
				heatmapcolors=["orange","purple"];

			doMatrix();
		});

	d3.select("#barchartoptions").on("change",function(d) {
			var index = d3.select(this).property("selectedIndex");
			s = d3.select(this).selectAll("option").filter(function (d, i) { return i === index });
			barchartoption = parseInt(s.attr("value"));

			d3.select("#barchart").selectAll("*").remove();
			doBarchart();
		});
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
	if (drawSVG) {
		try {
			var svg = d3.select("#fixedTooltip");
			svg.selectAll("*").remove();

			//window.open("file:///" + svgPfad + "/svg" + d[0] + ".svg");

			d3.xml("file:///" + svgPfad + "/svg" + (parseFloat(d[0])+1) + ".svg", "image/svg+xml", function(error, xml) {
					if (error) throw error;

					var svgNode = xml.getElementsByTagName("svg")[0];
					svg.node().appendChild(svgNode);
					svg.select("#plotting-area").select("g")
						.attr("transform","scale(0.25,0.25)")
						.on("click",function() {
							window.open("file:///" + svgPfad + "/svg" + (parseFloat(d[0])+1) + ".svg");
						});
					});

			d3.select("#fixedTooltipDiv").select("p").remove();

			svg.append('image').attr('xlink:href','close.jpg')
				.attr('height', 20)
				.attr('width', 20)
				.attr('x',130)
				.attr('y',0)
				.on("click",function(d) {
					d3.select("#fixedTooltipDiv").append("p");
					svg.selectAll("*").remove();
				});
		}
		catch(err)
		{
			alert("File nicht gefunden");
		}

		/*var group = svg.append("g").attr("class","vis");

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
					svg.node().appendChild(svgNode);
					svg.select("#plotting-area").select("g")
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
				svg.select("#plotting-area").remove();
				svg.selectAll(".vis").remove();
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

		d3.event.stopPropagation();*/
	}
}

function resetMatrixFilter() {
	heatmapfilteri=-1;
	heatmapfilterj=-1;
	doMatrix();
}
