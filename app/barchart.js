function doBarchart() {
	var svg = d3.select("#barchart");
	
	var height = 250;
	var width = 500;
	var axis_distance=30;
	
/*	svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);
*/

	var cluster_count=clusters.length;

	var x_scale = d3.scale.linear()
                .domain([0, cluster_count])
                .range([0, width]);

	var y_scale = d3.scale.linear()
		.domain([0, d3.max( clusters, function (d) { return d.length;})])
		.range([0, height]);

	var x_axis = d3.svg.axis()
		.scale(x_scale)
		.orient("bottom");

	var y_axis = d3.svg.axis()
 		.scale(y_scale)
		.orient("left");
		//.ticks(10, "%");

	var canvas = svg.attr("width", width)
			.attr("height", height + axis_distance)
			.append("g")
			.attr("transform", "translate(20,0)");

//	x_scale.domain(results.map(function(d) { return d[1]; }));
//	y_scale.domain([0, d3.max(data, function(d) { return d.frequency; })]);

/*	svg.append("g")
		.attr("class", "xaxis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis);

	svg.append("g")
		.attr("class", "yaxis")
		.call(y_axis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Frequency");
*/
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
                                console.log(d.length);
                                console.log(y_scale(d.length))
                                return y_scale(d.length);
                        });

	console.log("Barchart done");
}
