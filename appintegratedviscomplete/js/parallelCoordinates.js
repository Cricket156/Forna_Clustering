function doParallelCoordinates() {
	var beschreibung = "The Parallel Coordinates can be used to find similar Visualizations based on their Parameters. By hovering over one line, the associated Visualization in the Heatmap will be highlighted.";

	var data;

	var x, y, dragging, line, axis, background, foreground;
	d3.select("#parallelCoordinates").selectAll("*").remove();

	var marginTop = 30,
		marginBottom = 10,
		marginSide = 10;

	var width = document.getElementById('parallelCoordinatesDiv').clientWidth - 2*marginSide;
	var height = (window.innerHeight-60)*(2/3) - marginBottom - marginTop;

	//	width = parseFloat(d3.select("#parallelCoordinates").style("width")) - 2*marginSide,
	//	height = parseFloat(d3.select("#parallelCoordinates").style("height")) - marginBottom - marginTop;

	var svg = d3.select("#parallelCoordinates")
		.attr("width", width + 2*marginSide)
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

	var div = d3.select("body").append("div")
		.attr("class", "tooltipLarge")
		.style("opacity", 0);

	if (matrixfilter != -1) {
		wrapper.append("g")
			.attr("transform", "translate(" + marginSide + "," + marginTop + ")");

		var clusterposition;

		for(var i=0;i<clusters.length;++i)
		{
			if(clusters[i][0][1]==matrixfilter)
				clusterposition=i;
		}

		data = cutData(clusters[clusterposition]);

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
		background = wrapper.select("g").append("g")
			.attr("class", "background")
			.selectAll("path")
			.data(data)
			.enter().append("path")
			.attr("d", path);

		// Add blue foreground lines for focus.
		foreground = wrapper.select("g").append("g")
			.attr("class", "foreground")
			.selectAll("path")
			.data(data)
			.enter().append("path")
			.attr("d", path)
			.attr("class",function(d,i) {
					if(i!=0)
						return "p" + clusters[clusterposition][i-1][0];
					else
						return "labels";
				})
			.on("click", function(d, i) {
				showSVG(clusters[clusterposition][i-1], wrapper);
			})
			.on('mouseover', function(d, i) {
				d3.selectAll(".p"+clusters[clusterposition][i-1][0]).style("stroke-width",3).style("stroke","red");
				d3.select("#matrix").selectAll(".r"+clusters[clusterposition][i-1][0]).style("stroke", "white").style("stroke-width",4);

				div.transition()
					.duration(200)
					.style("opacity", .9);

				div.html(function() {
						var text = "";
						for (var j = 0; j < columnnames.length-1; j++) {
							text = text + columnnames[j] + ": " + clusters[clusterposition][i-1][j] + "<br>";
						}
						return text;
					})
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
				})
			.on('mouseout', function(d, i) {
					d3.selectAll(".p"+clusters[clusterposition][i-1][0]).style("stroke-width",1).style("stroke","midnightblue");
				//	d3.select(".foreground").selectAll(".path").style("stroke-width",1).style("stroke","midnightblue");
					d3.select("#matrix").selectAll("rect").style("stroke", "none");

					div.transition()
						.duration(500)
						.style("opacity", 0);
				});

		// Add a group element for each dimension.
		var g = wrapper.select("g").selectAll(".dimension")
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
				d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d])
					.on("brushstart", function() {
						d3.event.sourceEvent.stopPropagation();
					})
					.on("brush", brush));
			})
			.selectAll("rect")
			.attr("x", -8)
			.attr("width", 16);

	}

	console.log("ParallelCoordinates done");

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
		for (var i = 5; i < columnnames.length-1; i++) {
			line.push(columnnames[i]);
		}

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
}
