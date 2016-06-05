function doSliders() {
	var data;

	var x, y, dragging, line, axis, background, foreground;	
	d3.select("#sliders").selectAll("*").remove();
	
	var marginTop = 20,
		marginBottom = 10,
		marginSide = 30;
		
	var width = document.getElementById('sliderDiv').clientWidth - 2*marginSide;
	var height = document.getElementById('sliderDiv').clientHeight - marginBottom - marginTop;
	
	var svg = d3.select("#sliders")
		.attr("width", width + 2*marginSide)
		.attr("height", height + marginBottom + marginTop);
	
	var wrapper = svg.append('g');

	wrapper.append("g")
		.attr("transform", "translate(" + marginTop + "," + marginSide + ")");
		
	data = cutData(results);

	x = {};
	y = d3.scale.ordinal().rangePoints([0, height], 1);
	dragging = {};

	line = d3.svg.line();
	axis = d3.svg.axis().orient("left");
	
// Extract the list of dimensions and create a scale for each.
	y.domain(dimensions = d3.keys(data[0]).filter(function(d) {
		return d != "name" && (x[d] = d3.scale.linear()
			.domain(d3.extent(data, function(p) { return +p[d]; }))
			.range([width, 0]));
	}));
	
/*
// Add grey background lines for context.
	background = wrapper.select("g").append("g")
		.attr("class", "background")
		.selectAll("path")
		.data(data)
		.enter().append("path")
		.attr("d", path);
*/
// Add blue foreground lines for focus.
	foreground = wrapper.select("g").append("g");
/*
	bar.append("rect")
		.attr("x", 1)
		.attr("width", x(data[0].dx) - 1)
		.attr("height", function(d) { return height - y(d.y); });

	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", 6)
		.attr("x", x(data[0].dx) / 2)
		.attr("text-anchor", "middle")
		.text(function(d) { return formatCount(d.y); })
*/
// Add a group element for each dimension.
	var g = wrapper.select("g").selectAll(".dimension")
		.data(dimensions)
		.enter().append("g")
		.attr("class", "dimension")
		.attr("transform", function(d) { 
			return "rotate(270), translate(" + y(d)*(-1) + ")";
//			return "translate(" + y(d) + ")"; 
		});

// Add an axis and title.
	g.append("g")
		.attr("class", "axis")
		.each(function(d) { 
			d3.select(this).call(axis.scale(x[d])); 
		})
		.append("text")
		.style("text-anchor", "middle")
		.attr("y", -9)
		.text(function(d) { return data[0][d]; });
	
// Add and store a brush for each axis.
	g.append("g")
		.attr("class", "brush")
		.each(function(d) {
			d3.select(this).call(x[d].brush = d3.svg.brush().y(x[d]).on("brushstart", function() {
					d3.event.sourceEvent.stopPropagation();
				}).on("brush", brush));
		})
		.selectAll("rect")
		.attr("x", -8)
		.attr("width", 16);

	console.log("sliders done");
	
		function position(d) {
		var v = dragging[d];
		return v == null ? x(d) : v;
	}

	// Returns the path for a given data point.
	function path(d) {
		return line(dimensions.map(function(p) { 
			return [position(p), y[p](d[p])]; 
		}));
	}

	// Handles a brush event, toggling the display of foreground lines.
	function brush() {
		var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
			extents = actives.map(function(p) { return y[p].brush.extent(); });
		
		foreground.style("display", function(d) {
			return actives.every(function(p, i) {
				return extents[i][0] <= d[p] && d[p] <= extents[i][1];
			}) ? null : "none";
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
		console.log(newData);
		return newData;	
	}
}
