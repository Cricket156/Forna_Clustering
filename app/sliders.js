function doSliders() {
	var data;

	var x, y, dragging, line, axis, background, foreground;
	
	var marginTop = 20,
		marginBottom = 10,
		marginSide = 30;
		
	var width = document.getElementById('sliderDiv').clientWidth - 2*marginSide;
	var height = document.getElementById('sliderDiv').clientHeight - marginBottom - marginTop;
	
	var svg = d3.select("#sliders")
		.attr("width", width + 2*marginSide)
		.attr("height", height + marginBottom + marginTop);
	
	var wrapper = svg.append('g');
	
	data = cutData(results);
	
	var foreground;
	
	var dimensions = [];
	
	for (var j = 0; j < data[0].length; j++) {
		var y_scale = {};
		var x_scale = {};
		var map = data.map(function (d, i) {if (i > 0) { return d[j];}})       
				
		var histogram = d3.layout.histogram()
			.bins(7)(map);
			
		y_scale = d3.scale.linear()
			.domain([0,d3.max( histogram.map (function (i) { return i.length;}))])
			.range([0,height/data[j].length-marginTop]);
 
		x_scale = d3.scale.linear()
			.domain([0, d3.max(map)])
			.range([0, width]);
 
		var x_axis = d3.svg.axis()
			.scale(x_scale)
			.orient("bottom");
		
		var brush = d3.svg.brush()
			.x(x_scale)
			.on("brush", brushed);
			
		var canvas = wrapper.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(20," + height/data[0].length*(j)*(-1) + ")");

		var g = canvas.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0,"    +  height + ")")
			.call(x_axis);

		canvas.selectAll("rect")
			.data(histogram)
			.enter()
			.append("g")
			.append("rect")
			// startpunkt 
			.attr("x", function (d) { return x_scale(d.x);} )
			.attr("y", function (d) { return height - y_scale(d.y); } )
			// breite ist span des intervalls . 
			.attr("width", function (d) { return x_scale(d.dx);} )
			// höhe ist anzahl der elemente 
			.attr("height", function (d) { return y_scale(d.y);} )
			.attr("fill", "red");


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
