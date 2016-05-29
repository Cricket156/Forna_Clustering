function doBarchart() {
	var svg = d3.select("#barchart");
	
	var clusters_filtered=[];
	
	var grenze=10;
	if(clusters.length<10)
		grenze=clusters.length;
	
	for(var i=0;i<grenze;++i)
		clusters_filtered.push(clusters[i]);
	
	
	var m = [40, 40, 40, 40];
	
	var width = document.getElementById('barchartDiv').clientWidth - m[1] - m[3];
	var height = (window.innerHeight-60)*(1/3) - m[0] - m[2];
	
	var axis_distance=30;

	var cluster_count=clusters_filtered.length;
	
	var x_scale = d3.scale.linear()
                .domain([0, cluster_count])
                .range([0, width]);

	var y_scale = d3.scale.linear()
		.domain([0, d3.max( clusters_filtered, function (d) { return d.length;})])
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
                .domain([0, d3.max( clusters_filtered, function(d) {
				return d3.mean(d, function(d) {
					return d[2];
				})
			})])
                .range([0, height]);

	//TODO weitere scales fuer die anderen Penalties

	svg.selectAll(".overlaps")
		.data(clusters_filtered)
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
				return overlaps_scale(d3.mean(d, function(d) {
													return d[2];
												}));
			})
		.style("fill","green");

	svg.selectAll(".stretches")
                .data(clusters_filtered)
                .enter().append("rect")
                .attr("class", "stretches")
                .attr("x", function(d,i) {
                                return x_scale(i+1.0/5.0);
                        })
                .attr("width", x_scale(1.0/5.0))
                .attr("y", function(d) {
                                return height + axis_distance - overlaps_scale(d3.mean(d, function(d) {
                                				        		return d[3];
                                						}));
                        })
                .attr("height", function(d) {
                                return overlaps_scale(d3.mean(d, function(d) {
                                				        		return d[3];
                                						}));
                        })
		.style("fill","red");

	svg.selectAll(".position")
                .data(clusters_filtered)
                .enter().append("rect")
                .attr("class", "position")
                .attr("x", function(d,i) {
                                return x_scale(i+2.0/5.0);
                        })
                .attr("width", x_scale(1.0/5.0))
                .attr("y", function(d) {
                                return height + axis_distance - overlaps_scale(d3.mean(d, function(d) {
                                				        		return d[4];
                                						}));
                        })
                .attr("height", function(d) {
                                return overlaps_scale(d3.mean(d, function(d) {
                                				        		return d[4];
                                						}));
                        })
		.style("fill","blue");

	svg.selectAll(".count")
                .data(clusters_filtered)
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
                        });
		
	svg.selectAll("rect")
		.on("click", function(d) {
				//d3.select("#matrix").selectAll("rect").style("fill", );
				
					/*
				d3.select(this).each(function(d) {
					console.log(cluster);
					if(cluster != d) {
						d3.select(this).style("opacity", 0.5);
					}
				});
				*/
				cluster=d[0][1];

				if(cluster==matrixfilter)
				{
					rangeschanged=true;
					matrixfilter=-1;
					doMatrix();
					doParallelCoordinates();
					rangeschanged=false;
				
				svg.selectAll("rect").each(function(d) {
						if(cluster != d[0][1]) {
							d3.select(this).style("opacity", 1.0);
						}
					});
				}
				else// if(-1==matrixfilter)
				{
					rangeschanged=true;
					matrixfilter=cluster;
					doMatrix();
					doParallelCoordinates();
					rangeschanged=false;

					d3.select("#matrix").selectAll("rect").style("opacity",1.0);
					
				svg.selectAll("rect").each(function(d) {
						if(cluster != d[0][1]) {
							d3.select(this).style("opacity", 0.5);
						}
					});
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
