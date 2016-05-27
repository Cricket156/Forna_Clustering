function doBarchart() {
	var svg = d3.select("#barchart");

	// margins top, right, bottom, left extra space to fit labels
	var m = [40, 40, 40, 40];
	var  width = 600 - m[1] - m[3];
	var  height = 500 - m[0] - m[2];
	// var height = 250;
	// var width = 500;
	var axis_distance=30;

/*	svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);
*/

	var cluster_count=clusters.length;

	var counter = 0;
	var len = 0;
	// average cluster results
  var cluster_penaltyarray = [];
	var clusterlengtharray = [];
	var totalposition = 0;
	var totaloverlap = 0;
	var totalstretches = 0;
	var previous = 0;
	var current = 0;
	var globavg =0;
	var globalsum = 0;
	var avgpercluster = [];
	var gobalavgarr = [];

		// produce array with only penalties
		clusters.forEach(function(d) {
			// fore each node e in cluster
			len = +d.length
			clusterlengtharray.push(len);
			d.forEach(function(e){
				// adds numcluster, overlaps, stretches, position
				cluster_penaltyarray.push([+e[1], +e[2], +e[3], +e[4], len]);
				 })
				  });
			// // gets average for each cluster penalties
// TODO: da ist irgendwo ein minifehler drinnen und bei den totaloverlaps wird irgendwo eins
// dazugezaehlt
// average penalties per cluster
			// mean = d3.mean(selectedData,function(d) { return +d.reading})
				cluster_penaltyarray.forEach(function(e){
					current = e[0];
					if (current == previous){
						totaloverlap += e[1];
						totalstretches += e[2];
						totalposition += e[3];

					}
					else{
						totaloverlap += e[1];
						totalstretches += e[2];
						totalposition += e[3];
						len = +e[4];
						avgpercluster.push([totaloverlap/len, totalstretches/len, totalposition/len]);
						totaloverlap = 0;
						totalstretches = 0;
						totalposition = 0;

					}
					previous = current;

			});
//console.log(avgpercluster)
// now average over all averages of clusters (global average)
//TODO: pushing global average into array doesn't work for reasons I can't understand
// avgpercluster.forEach(function(d){
//  globavg = ((+d[0] + +d[1] + +d[2])/cluster_count);
//  console.log(globavg);
//  // globalavgarr.push(globavg);
// });
//
//  console.log(globalavgarr);
	
	
	var x_scale = d3.scale.linear()
                .domain([0, cluster_count])
                .range([0, width]);

	var y_scale = d3.scale.linear()
		.domain([0, d3.max( clusters, function (d) { return d.length;})])
		.range([0, height]);

	var x_axis = d3.svg.axis()
		.scale(x_scale)
		.orient("bottom");

//ticks y axis
	var y_axisleft = d3.svg.axis()
		.orient("left");

		var y_axisright = d3.svg.axis()
	 		.scale(y_scale)
			.orient("right")
			.ticks(10);


	var canvas = svg.attr("width", width + m[3] + m[1])
	    .attr("height", height + m[0] + m[2])
	    .append("g")
	    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

//	x_scale.domain(results.map(function(d) { return d[1]; }));
//	y_scale.domain([0, d3.max(data, function(d) { return d.frequency; })]);

	var height2=height+axis_distance;
	var width2 = width-m[0]

	svg.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(0," + height2 + ")")
		.call(x_axis);


	svg.append("g")
		.attr("class", "yaxisright")
		// .attr("transform", "translate(0," + height/2 + ")")
		.call(y_axisright)
		.select("text")
		.attr("y", width-20)
		.attr("dy", 6)
		.attr("font-size","15px")
		.attr("transform", "rotate(-90)");

		svg.append("g")
			.attr("class", "yaxisleft")
			.attr("transform", "translate(0," + height/2 + ")")
			.call(y_axisleft)
			.select("text")
			.attr("y", width+20)
			.attr("dy", 6)
			.attr("font-size","15px")
			.attr("transform", "rotate(-90)")
			.text("Frequency");



	var overlaps_scale = d3.scale.linear()
                .domain([0, d3.max( clusters, function(d) {
				return d3.mean(d, function(d) {
					return d[2];
				})
			})])
                .range([0, height]);

	//TODO weitere scales fuer die anderen Penalties

	svg.selectAll(".overlaps")
		.data(clusters)
		.enter().append("rect")
		.attr("class", "overlaps")
		.attr("x", function(d,i) {
				return x_scale(i);
			})
		.attr("width", x_scale(1.0/5.0))
		.attr("y", function(d) {
				return height + axis_distance - overlaps_scale(d3.mean(d, function(d) {
                                				        		return d[2];
                                						}));
			})
		.attr("height", function(d) {
				return overlaps_scale(d[0][2]);
			})
		.style("fill","green");

	svg.selectAll(".stretches")
                .data(clusters)
                .enter().append("rect")
                .attr("class", "stretches")
                .attr("x", function(d,i) {
                                return x_scale(i+1.0/5.0);
                        })
                .attr("width", x_scale(1.0/5.0))
                .attr("y", function(d) {
                                return height + axis_distance - overlaps_scale(d[0][3]);
                        })
                .attr("height", function(d) {
                                return overlaps_scale(d[0][3]);
                        })
		.style("fill","red");

	svg.selectAll(".position")
                .data(clusters)
                .enter().append("rect")
                .attr("class", "position")
                .attr("x", function(d,i) {
                                return x_scale(i+2.0/5.0);
                        })
                .attr("width", x_scale(1.0/5.0))
                .attr("y", function(d) {
                                return height + axis_distance - overlaps_scale(d[0][4]);
                        })
                .attr("height", function(d) {
                                return overlaps_scale(d[0][4]);
                        })
		.style("fill","blue");

	svg.selectAll(".count")
                .data(clusters)
                .enter().append("rect")
                .attr("class", "count")
                .attr("x", function(d,i) {
                                return x_scale(i+3.0/5.0);
                        })
                .attr("width", x_scale(1.0/5.0))
                .attr("y", function(d) {
                                return height + axis_distance - y_scale(d.length);
                        })
                .attr("height", function(d) {
                                return y_scale(d.length);
                        })
		.on("click", function(d) {
				//d3.select("#matrix").selectAll("rect").style("fill", );
				cluster=d[0][1];

				if(cluster==matrixfilter)
				{
					rangeschanged=true;
					matrixfilter=-1;
					doMatrix();
					doParallelCoordinates();
					rangeschanged=false;
				}
				else// if(-1==matrixfilter)
				{
					rangeschanged=true;
					matrixfilter=cluster;
					doMatrix();
					doParallelCoordinates();
					rangeschanged=false;

					d3.select("#matrix").selectAll("rect").style("opacity",1.0);
				}

				d3.select("#matrix").selectAll("rect").style("opacity",1.0);

				d3.event.stopPropagation();
			})
		.on("mouseover", function(d) {
				cluster=d[0][1];
				d3.select("#matrix").selectAll("rect").each( function(d){
					if(cluster!=d[1])
						d3.select(this).style("opacity",0.5);
				});
				d3.event.stopPropagation();
			})
		.on("mouseout", function(d) {
				d3.select("#matrix").selectAll("rect").style("opacity",1.0);
				d3.event.stopPropagation();
                        });

	console.log("Barchart done");
}
