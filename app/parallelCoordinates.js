var data;

var test;

var x, y, dragging, line, axis, background, foreground;

function doParallelCoordinates() {
	d3.select("#parallelCoordinates").selectAll("*").remove();
	
	var marginTop = 30,
		marginBottom = 10,
		marginSide = 10;
		width = parseFloat(d3.select("#parallelCoordinates").style("width")),
		height = parseFloat(d3.select("#parallelCoordinates").style("height"));
	
	var svg = d3.select("#parallelCoordinates")
		.attr("width", width + 2*marginSide)
		.attr("height", height + marginBottom + marginTop)
		.append("g")
		.attr("transform", "translate(" + marginSide + "," +marginTop + ")");
	
	/*
	var svg = d3.select("#parallelCoordinates");
	
	svg.attr("width", parseFloat(svg.style("width")) + 2*marginSide)
		.attr("height", parseFloat(svg.style("height")) - marginBottom - marginTop);

	svg.append("g")
		.attr("transform", "translate(" + marginSide + "," +marginTop + ")");
	
	*/
	/*
	var svg = d3.select("#parallelCoordinates")
		.append("g")
		.attr("transform", "translate(" + 10 + "," + 30 + ")");;
	*/
	if (matrixfilter != -1) {
		
		data = cutData(clusters[matrixfilter]);

		x = d3.scale.ordinal().rangePoints([0, width], 1);
		y = {};
		dragging = {};

		line = d3.svg.line();
		axis = d3.svg.axis().orient("left");
		
		// Extract the list of dimensions and create a scale for each.
		x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
			return d != "name" && (y[d] = d3.scale.linear()
				.domain(d3.extent(data, function(p) { return +p[d]; }))
				.range([height, 0]));
		}));

		// Add grey background lines for context.
		background = svg.append("g")
			.attr("class", "background")
			.selectAll("path")
			.data(data)
			.enter().append("path")
			.attr("d", path);


		// Add blue foreground lines for focus.
		foreground = svg.append("g")
			.attr("class", "foreground")
			.selectAll("path")
			.data(data)
			.enter().append("path")
			.attr("d", path)
			.on("click", function(d, i) {
				console.log(d);
				console.log(results[i+1]);
			});

		// Add a group element for each dimension.
		var g = svg.selectAll(".dimension")
			.data(dimensions)
			.enter().append("g")
			.attr("class", "dimension")
			.attr("transform", function(d) { 
				return "translate(" + x(d) + ")"; 
			});

	  // Add an axis and title.
		g.append("g")
			.attr("class", "axis")
			.each(function(d) { 
				d3.select(this).call(axis.scale(y[d])); 
			})
			.append("text")
			.style("text-anchor", "middle")
			.attr("y", -9)
			.text(function(d) { return data[0][d]; });

		// Add and store a brush for each axis.
		g.append("g")
			.attr("class", "brush")
			.each(function(d) {
				d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
			})
			.selectAll("rect")
			.attr("x", -8)
			.attr("width", 16);
	}
}

function position(d) {
	var v = dragging[d];
	return v == null ? x(d) : v;
}

function transition(g) {
	return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
	return line(dimensions.map(function(p) { 
		return [position(p), y[p](d[p])]; 
	}));
}

function brushstart() {
	d3.event.sourceEvent.stopPropagation();
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

	var line = ["friction", "middleCharge", "otherCharge", "multiplier", "chargeDistance"];
	newData.push(line);
	for (var i = 0; i < data.length; i++) {
		var line = [];
		for (var j = 5; j < data[i].length-1; j++) {
			line.push(data[i][j]);
		}
		newData.push(line);
	}
	
	return newData;	
}