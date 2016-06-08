var original_filters = [];

var new_filters = [];

function doSliders() {
	d3.select("#sliders").selectAll("*").remove();
	
	var data;

	var x, y, dragging, line, axis, background, foreground;
	
	var marginTop = 40,
		marginBottom = 10,
		marginLeft = 20,
		marginRight = 40;
		
	var width = document.getElementById('sliderDiv').clientWidth - marginLeft - marginRight;
	var height = document.getElementById('sliderDiv').clientHeight - marginBottom - marginTop;
	
	var svg = d3.select("#sliders")
		.attr("width", width + marginLeft + marginRight)
		.attr("height", height + marginBottom + marginTop);
	
	var wrapper = svg.append('g');
	
	wrapper.append("g")
		.attr("transform", "translate(" + marginLeft + "," + marginTop + ")");
	
	data = cutData(original_results);
	
	var bins = 8;
	
	y_scale = d3.scale.ordinal().rangePoints([0, height], 1);
	x_scale = {};
	
	axis = d3.svg.axis().ticks(bins/2).orient("bottom");
	
	y_scale.domain(slider_dimensions = d3.keys(data[0]).filter(function(d) {
		return d != "name" && (x_scale[d] = d3.scale.linear()
			.domain(d3.extent(data, function(p) { return +p[d]; }))
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
		})
		.selectAll("rect")
		.attr("x", 0)
		.attr("y", -9)
		.attr("width", width)
		.attr("height", 16);
		
			
	for (var j = 0; j < data[0].length; j++) {
		original_filters.push(x_scale[j].domain());
		new_filters.push(x_scale[j].domain());
		
		var map = data.map(function (d, i) {if (i > 0) { return d[j];}})       
		
		var histogram = d3.layout.histogram()
			.bins(bins)(map);
			
		var y_scale_bars = d3.scale.linear()
			.domain([0, d3.max(histogram.map( function (i) { return i.length;}))])
			.range([0, height/data[0].length-marginTop]);
			
		var canvas = wrapper.attr("width", width)
			.attr("height", height + 30)
			.append("g")
			.attr("transform", "translate(20," + y_scale(j)/*height/data[0].length*(j)*/ + ")");

		canvas.selectAll("rect")
			.data(histogram)
			.enter()
			.append("g")
			.append("rect")
			.attr("x", function (d) {
				return x_scale[j](d.x) - (width/bins) + 1;
			})
			.attr("y", function (d) { 
				return height/data[0].length-marginTop - 1 - y_scale_bars(d.y);
			}) 
			.attr("width", function (d) {
				return (width/bins) - 3;
			})
			.attr("height", function (d) { 
				if(y_scale_bars.domain()[1] != data.length-1) {
					return y_scale_bars(d.y);
				}
			})
			.attr("fill", "red");
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
	

}

var original_results = [];

function SlidersApplyFilter() {
	
	console.log("hier");
		
	console.log("old " + results.length);
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
	
	console.log("new " + results.length);
	
	extractClusters();
	
	doAll();
}
	
function SlidersResetFilter() {
	results = original_results;
	new_filters = original_filters;
	console.log("da");
	
	doAll();
	
	d3.select("#sliders").selectAll("*").remove();
	doSliders();
}