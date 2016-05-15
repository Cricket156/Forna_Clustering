function doParallelCoordinates() {
/*	var svg = d3.select("#parallelCoordinates");
	
	svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);
*/		
	data = clusters[3];
	var pc = d3.parcoords()("#example")
	  .data(data)
	  .render()
	  .createAxes();
		
	console.log("Parallel Coordinates done");
}