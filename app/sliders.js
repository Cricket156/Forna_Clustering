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
	
	if (matrixfilter != -1) {
		data = cutData(clusters[matrixfilter]);
	}
	else {
		data = cutData(results);
	}
	
	console.log(data);
	
	var foreground = [];
	var brushes = [];
	
	var dimensions = [];
	var bins = 10;
	
	var axis_distance = 20;
	
	
	for (var j = 0; j < data[0].length; j++) {
		var y_scale = {};
		var x_scale = {};
		
		var map = data.map(function (d, i) {if (i > 0) { return d[j];}})       
				
		var histogram = d3.layout.histogram()
			.bins(bins)(map);
			
		y_scale = d3.scale.linear()
			.domain([/*d3.min(histogram.map( function (i) { return i.length;}))*/ 0,
					 d3.max(histogram.map( function (i) { return i.length;}))])
			.range([0,height/data[0].length-marginTop]);
 
		x_scale = d3.scale.linear()
			.domain([d3.min(map), d3.max(map)])
			.range([0, width]);

		var abstand = d3.max(map) - d3.min(map);
		abstand /= bins;
		
		var x_axis = d3.svg.axis()
			.scale(x_scale)
			.ticks(bins/2)
			.orient("bottom");
		
		var brush = d3.svg.brush()
			.x(x_scale)
			.on("brush", function(d) {//brushed);
					var extent0 = brush.extent();
					console.log(extent0);
				});
			
		var canvas = wrapper.attr("width", width)
			.attr("height", height + axis_distance)
			.append("g")
			.attr("transform", "translate(20," + height/data[0].length*(j)*(-1) + ")");

		var g = canvas.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0,"    +  height + ")")
			.call(x_axis);

		foreground.push(canvas.selectAll("rect")
			.data(histogram)
			.enter()
			.append("g")
			.append("rect")
			// startpunkt 
			.attr("x", function (d) { 
				return x_scale(d.x);
			})
			.attr("y", function (d) { return height - y_scale(d.y); } )
			// breite ist span des intervalls . 
			.attr("width", function (d) {
				if (d.dx != 0) {
					return (width/bins) - 3;
				}
				/*
				console.log(d.dx);
				return x_scale(d.dx);
				*/
			})
			// höhe ist anzahl der elemente 
			.attr("height", function (d) { return y_scale(d.y);} )
			.attr("fill", "red"));

		canvas.append("g")
			.attr("class", "brush")
			.attr("transform", "translate(0,"    +  height + ")")
			.call(brush)
			.selectAll("rect")
			.attr("y", -9)
			.attr("width", width)
			.attr("height", 16);
	}
	
	
	function brushed() {
		var extent0 = brush.extent();
		console.log(extent0);
//		foreground[3].style("display", "none");
//		x_scale.domain(brush.empty);
		/*
		if (brush.empty) {
			foreground.selectAll("rect")
				.attr("fill", "grey");
		}
		else {
			console.log("nope");
		}
		*/
		//x_scale.domain(brush.empty() ? console.log(brush.empty) : brush.extent());
		/*
		var actives = dimensions.filter(function(p) { return !y_scale[p].brush.empty(); }),
			extents = actives.map(function(p) { return y_scale[p].brush.extent(); });
		
		foreground.style("display", function(d) {
			return actives.every(function(p, i) {
				return extents[i][0] <= d[p] && d[p] <= extents[i][1];
			}) ? null : "none";
		});
		*/
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
