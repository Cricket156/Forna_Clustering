var original_filters = [];
var new_filters = [];

function doSliders() {

	var beschreibung = "These widgets are used to filter for attributes. After you are done with your selection using the widgets click apply filter. Brush over the axes to filter the parameters.";
	
	d3.select("#sliders").selectAll("*").remove();
	
	var data,original_data;

	var x, y, dragging, line, axis, background, foreground;
	
	var marginTop = 40,
		marginBottom = 10,
		marginLeft = 20,
		marginRight = 40;
		
	var width = document.getElementById('sliderDiv').clientWidth - marginLeft - marginRight;
	var height = (window.innerHeight-60 - 30) - marginBottom - marginTop
//	var height = document.getElementById('sliderDiv').clientHeight - marginBottom - marginTop;
	
	var svg = d3.select("#sliders")
		.attr("width", width + marginLeft + marginRight)
		.attr("height", height + marginBottom + marginTop)
		.on("mouseover", function(d) {
			//writeBarchartText();
			d3.select("#fixedTooltipDiv")
				.select("p")
				.text(beschreibung);
		})
		.on("mouseout", function(d) {
			d3.select("#fixedTooltipDiv")
				.select("p")
				.text("");
		});
	
	var wrapper = svg.append('g');
	
	wrapper.append("g")
		.attr("transform", "translate(" + marginLeft + "," + marginTop + ")");
	
	var div = d3.select("body").append("div")	
		.attr("class", "tooltipSmall")				
		.style("opacity", 0);
	
	//data = cutData(original_results);
	
	var clusterposition;
		
	if(-1!=matrixfilter)
	{
		for(var i=0;i<clusters.length;++i)
		{
			if(clusters[i][0][1]==matrixfilter)
				clusterposition=i;
		}
		
		data = cutData(clusters[clusterposition]);
	}
	else
		data = cutData(results);
		
	original_data = cutData(original_results);
	
	var bins = [];
	var stepSizes = [];
	
	for(var i=0;i<data[0].length;++i)
	{
		min1 = d3.min(original_results,function(d) {
				return d[2+i];
			});
		min2 = d3.min(original_results,function(d) {
				if(d[2+i]>min1)
					return d[2+i];
			});
		
		if(isNaN(min2))
			stepSizes.push(0);
		else
			stepSizes.push(min2-min1);
	}
	
	for(var i=0;i<stepSizes.length;++i)
	{
		var min = d3.min(original_results,function(d) {
				return d[2+i];
			});
		var max = d3.max(original_results,function(d) {
				return d[2+i];
			});
			
		var bin=0;
		
		if(0==stepSizes[i])
			bin=1;
		else
			bin=(Math.abs(max-min))/stepSizes[i]+1;
		
		//if(i<anzahlPenalties || bin > 8)
		//	bin=8;
		
		if(bin>10)
		{
			if(bin>20)
				bin=10;
			else if(bin%2==0)
				bin/2;
		}
		
		bins.push(bin);
	}
	
	y_scale = d3.scale.ordinal().rangePoints([0, height], 1);
	x_scale = {};
	
	axis = d3.svg.axis().ticks(4).orient("bottom");
	
	y_scale.domain(slider_dimensions = d3.keys(data[0]).filter(function(d) {
		return d != "name" && (x_scale[d] = d3.scale.linear()
			.domain(d3.extent(original_data, function(p) { return +p[d]; }))
			.range([width, 0]));
	}));
		
	var g = wrapper.select("g").selectAll(".dimension")
		.data(slider_dimensions)
		.enter().append("g")
		.attr("class", "dimension")
		.attr("transform", function(d) { 
			return "translate(0," + y_scale(d) + ")"; 
		});
		
	g.append("g")
		.attr("class", "axis")
		.each(function(d) { 
			d3.select(this).call(axis.scale(x_scale[d])); 
		})
		.append("text")
		.style("text-anchor", "middle")
		.attr("x", width/2)
		.attr("y", 30)
		.text(function(d) { return data[0][d]; });
	
	g.append("g")
		.attr("class", "brush")
		.each(function(d) {
			d3.select(this).call(x_scale[d].brush = d3.svg.brush().x(x_scale[d])
				.on("brushstart", function() {
					d3.event.sourceEvent.stopPropagation();
				})
				.on("brush", brush));
				
			x_scale[d].brush.extent([0, 0]);
		})
		.selectAll("rect")
		.attr("y", -9)
		.attr("height", 16);
		
			
	for (var j = 0; j < data[0].length; j++) {
		original_filters.push(x_scale[j].domain());
		new_filters.push(x_scale[j].domain());
		
		var data1 = [];
		var original_data1 = [];
		
		for(var x=1;x<data.length;++x)
			data1.push(data[x]);
		for(var x=1;x<original_data.length;++x)
			original_data1.push(original_data[x]);
			
		var map = data1.map(function (d, i) { return d[j];});
		var original_map = original_data1.map(function (d, i) {if (i > 0) { return d[j];}})
		
		var histogram;

		var histogram = d3.layout.histogram().range(
					[d3.min(original_map/*original_results, function(d) { return d[j];}*/),
					 d3.max(original_map/*original_results, function(d) { return d[j];}*/)])
			.bins(bins[j])(map);
		
		var original_histogram = d3.layout.histogram().range(
					[d3.min(original_map/*original_results, function(d) { return d[j];}*/),
					 d3.max(original_map/*original_results, function(d) { return d[j];}*/)])
			.bins(bins[j])(original_map);
			
		var y_scale_bars = d3.scale.linear()
			.domain([0, d3.max(original_histogram.map( function (i) { return i.length;}))])
			.range([0, height/data[0].length-marginTop]);
			
		var canvas = wrapper.attr("width", width)
			.attr("height", height + 30)
			.append("g")
			.attr("transform", "translate(20," + y_scale(j) + ")");

		canvas.selectAll(".original")
			.data(original_histogram)
			.enter()
			.append("rect")
			.attr("class","original")
			.attr("x", function (d) {
				return x_scale[j](d.x) - (width/bins[j]) +1;
			})
			.attr("y", function (d) {
				return y_scale_bars(d.y) * (-1) + marginTop;// - 1 - y_scale_bars(d.y);
			})
			.attr("width", function (d) {
				return (width/bins[j]) - 3;
			})
			.attr("height", function (d) { 
				if(y_scale_bars.domain()[1] != data.length-1) {
					return y_scale_bars(d.y);
				}
			})
			.attr("fill", function() {
				if (j < anzahlPenalties) {
					return colors[j];
				}
				else {
					return "midnightblue";
				}
			})
			.attr("opacity",0.5);
			
		canvas.selectAll(".filtered")
			.data(histogram)
			.enter()
			.append("rect")
			.attr("class","filtered")
			.attr("x", function (d) {
				return x_scale[j](d.x) - (width/bins[j]) +1;
			})
			.attr("y", function (d) { 
				return y_scale_bars(d.y) * (-1) + marginTop;// - 1 - y_scale_bars(d.y);
			}) 
			.attr("width", function (d) {
				return (width/bins[j]) - 3;
			})
			.attr("height", function (d) { 
				if(y_scale_bars.domain()[1] != data.length-1) {
					return y_scale_bars(d.y);
				}
			})
			.attr("fill", function() {
				if (j < anzahlPenalties) {
					return colors[j];
				}
				else {
					return "midnightblue";
				}
			});
			
		svg.selectAll(".filtered, .original").on('mouseover', function(d) {
				d3.select("#fixedTooltipDiv")
					.select("p")
					.text(beschreibung);
				div.transition()		
					.duration(200)		
					.style("opacity", .9);	
					
				div.html(function() {
						var text = "frequency: <br>" + d.length;
						return text;
					})	
					.style("left", (d3.event.pageX) + "px")		
					.style("top", (d3.event.pageY - 28) + "px");
				})
			.on('mouseout', function(d) {
					div.transition()		
						.duration(500)		
						.style("opacity", 0);
				});
	}
	
	function brush() {
		var actives = slider_dimensions.filter(function(p) {
				return !x_scale[p].brush.empty(); 
			}),
			extents = actives.map(function(p) { 
				new_filters[p] = x_scale[p].brush.extent()
				return x_scale[p].brush.extent(); 
			});
	}
	
	function cutData(data) {
		var newData = [];

		var line = [];
		for (var i = 2; i < columnnames.length-1; i++) {
			line.push(columnnames[i]);
		}
		
		newData.push(line);
		for (var i = 0; i < data.length; i++) {
			var line = [];
			for (var j = 2; j < data[i].length-1; j++) {
				line.push(data[i][j]);
			}
			newData.push(line);
		}
		return newData;	
	}
	
	console.log("Sliders done");
}

function SlidersApplyFilter() {
	results = [];
		
	for (var i = 0; i < original_results.length; i++) {
		var check = true;
		for (var j = 0; j < slider_dimensions.length; j++) {
			if (original_results[i][j+2] < new_filters[j][0] || original_results[i][j+2] > new_filters[j][1]) {
				check = false;
			}
		}
		if (check) {
			results.push(original_results[i]);
		}
	}
	
	if (results.length != 0) {
		extractClusters();
		doAll();
		
		doSliders();
		
	}
	else {
		alert("This filter does not contain any nodes, the filter will be reseted");
		SlidersResetFilter();
	}
}
	
function SlidersResetFilter() {
	results = original_results;
	new_filters = original_filters;
	matrixfilter = -1;
	
	extractClusters();
	doAll();
	
//	d3.select("#sliders").selectAll("*").remove();
	doSliders();
	
	SlidersApplyFilter();
}