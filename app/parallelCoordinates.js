function doParallelCoordinates() {
	var svg = d3.select("#parallelCoordinates");
	
	svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);
		
	console.log("Parallel Coordinates done");
}