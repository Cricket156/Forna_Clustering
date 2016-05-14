function doBarchart() {
	var svg = d3.select("#barchart");
	
	var height = 250;
	var width = 500;
	
	svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);
	
/*	

	d3.csv("testdata.csv", function (data){
		var map = data.map(function (i) {return parseInt(i.age);})
		var histogram = d3.layout.histogram()
			.bins(2)
			(map)

		var y_scale = d3.scale.linear()
			.domain([0,d3.max( histogram.map (function (i) { return i.length;}))])
			.range([0,height]);

		var x_scale = d3.scale.linear()
			.domain([0, d3.max(map)])
			.range([0, width]);

		var x_axis = d3.svg.axis()
			.scale(x_scale)
			.orient("bottom");

		var group = svg.append("g")
			.attr("transform", "  translate(0,"    +  height + ")");

		var bardata = svg.selectAll(".bar")
			.data(histogram)
			.enter()
			.append("g");

		bardata.append("rect")
			.attr("x", function (d) { return x_scale(d.x); })
			.attr("y", function (d) { return 500 - y_scale(d.y); })
			.attr("width", function (d) { return x_scale(d.dx); }) 
			.attr("height", function(d) { return y_scale(d.y); })
			.style("fill", "red");

		bardata.append("text")
			.attr("x", function (d) {return x_scale(d.x);})
			.attr("y", function(d) {return 500 - y_scale(d.y);})
			.attr("dy", "22px")
			.attr("dx", function (d) { return x_scale(d.dx);})
			.attr("text-anchor", "middle")
			.text(function (d) {return d.y;});

	})
	*/

	console.log("Barchart done");
}