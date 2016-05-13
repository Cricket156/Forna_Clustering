function doMatrix() {
	var svg = d3.select("#matrix");
	
	svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);

	console.log("Matrix done");
}