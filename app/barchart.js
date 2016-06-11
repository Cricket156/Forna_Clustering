function doBarchart() {
	var svg = d3.select("#barchart");

	var clusters_filtered=[];

	var grenze=20;
	if(clusters.length<20)
		grenze=clusters.length;

	for(var i=0;i<grenze;++i)
		clusters_filtered.push(clusters[i]);

	var m = [40, 50, 40, 50];

	var width = document.getElementById('barchartDiv').clientWidth - m[1] - m[3];
	var height = (window.innerHeight-60)*(1/3) - m[0] - m[2];

	var axis_distance=30;

	var cluster_count=clusters_filtered.length;

	var x_scale = d3.scale.linear()
		.domain([0, cluster_count])
		.range([0, width]);

	var y_scale = d3.scale.linear()
		.domain([0, d3.max( clusters_filtered, function (d) { return d.length;})])
		.range([height, 0]);

	var x_axis = d3.svg.axis()
		.scale(x_scale)
		.orient("bottom")
		.ticks(0);

//ticks y axis
	// var y_axisleft = d3.svg.axis().orient("left");

	var y_axisleft = d3.svg.axis()
		.scale(y_scale)
		// .style("stroke-width", '1')
		.orient("left")
		.ticks(5);

	var y_axisright = d3.svg.axis()
		.scale(y_scale)
		.orient("right")
		.ticks(5);


	var svg = d3.select("#barchart")
		.attr("width", width + m[3] + m[1])
	    .attr("height", height + m[0] + m[2]);

	var wrapper = svg.append("g")
		.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	var draw = wrapper;//wrapper.append("g");

//	x_scale.domain(results.map(function(d) { return d[1]; }));
//	y_scale.domain([0, d3.max(data, function(d) { return d.frequency; })]);

	var height2=height+axis_distance;
	var width2 = width-m[0]

	draw.append("g")
		.attr("class", "xaxis axis")
		.attr("transform", "translate(0," + height + ")")
		.call(x_axis)
		.select("text")
		.attr("y", width+36)
		.attr("x", height/2);
		/*.attr("font-size","15px")
		.attr("transform", "rotate(-90)")
		.text("Penalties");*/

	draw.append("g")
		.attr("class", "yaxisright axis")
		.attr("transform", "translate(" + width + ",0)")
		.call(y_axisright)
		.select("text")
		.attr("transform", "rotate(-90),translate(0,40)")
		.text("Penalties");

	draw.append("g")
		.attr("class", "yaxisleft axis")
		.call(y_axisleft)
		.select("text")
		.attr("transform", "rotate(-90),translate(70,-40)")
		.text("NodeCount");
/*
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

*/

	var penalty_scale = d3.scale.linear()
                .domain([0, d3.max( clusters_filtered, function(d) {
				return d3.mean(d, function(d) {
					var all = 0;
					for(var i=0;i<anzahlPenalties;++i)
						all+=d[2+i];
					return all;
				})
			})])
                .range([0, height]);

	//TODO weitere scales fuer die anderen Penalties

	var colors = [];
	colors.push("green");
	colors.push("red");
	colors.push("blue");
	
	for(var i=0;i<anzahlPenalties;++i)
	{
		wrapper.selectAll(".penalties"+i)
			.data(clusters_filtered)
			.enter().append("rect")
			.attr("class", "penalties")
			.attr("x", function(d,index) {
					return x_scale(index);
				})
			.attr("width", x_scale(1.0/3.0))
			.attr("y", function(d) {
					return height - penalty_scale(d3.mean(d, function(d) {
								var previous = 0;
								for(var j=0;j<i;++j)
									previous+=d[2+j];
								return d[2+i]+previous;
							}));
				})
			.attr("height", function(d) {
					return penalty_scale(d3.mean(d, function(d) {
								return d[2+i];
							}));
				})
			.style("fill",colors[i]);
			
		wrapper.selectAll(".pticks")
			.data(clusters_filtered)
			.enter().append("text")
			.attr("class", "pticks")
			.attr("x", function(d,index) {
					return x_scale(index);
				})
			.attr("y", function(d) {
					return height+20;
				})
			.text(function(d) {
					return d[0][1];
				});
	}
	
	wrapper.selectAll(".count")
                .data(clusters_filtered)
                .enter().append("rect")
                .attr("class", "count")
                .attr("x", function(d,i) {
                                return x_scale(i+1.0/3.0);
                        })
                .attr("width", x_scale(1.0/3.0))
                .attr("y", function(d) {
                                return height - y_scale(d.length);
                        })
                .attr("height", function(d) {
                                return y_scale(d.length);
                        });
		
	svg.selectAll("rect")
		.on("click", function(d) {
				//d3.select("#matrix").selectAll("rect").style("fill", );
				
				cluster=d[0][1];

				if(cluster==matrixfilter)
				{
					rangeschanged=true;
					matrixfilter=-1;
					doMatrix();
					doParallelCoordinates();
					doSliders();
					rangeschanged=false;
				}
				else// if(-1==matrixfilter)
				{
					rangeschanged=true;
					matrixfilter=cluster;
					doMatrix();
					doParallelCoordinates();
					doSliders();
					rangeschanged=false;

					d3.select("#matrix").selectAll("rect").style("opacity",1.0);
				}
				
				// alle im Barchart auf Opacity 1 setzten
				svg.selectAll("rect").each(function(d) {
					d3.select(this).style("opacity", 1.0);
				});
				
				// die andern Hell oder dunkel setzen (je nach filter)
				if (-1 == matrixfilter) {
					svg.selectAll("rect").each(function(d) {
						if (cluster != d[0][1]) {
							d3.select(this).style("opacity", 1.0);
						}
					});
					barchartHover = true;
				}
				else {
					svg.selectAll("rect").each(function(d) {
						if(cluster != d[0][1]) {
							d3.select(this).style("opacity", 0.5);
						}
					});
					barchartHover = false;
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
								
				if(barchartHover)
				{
					svg.selectAll("rect").each(function(d) {
						if(cluster != d[0][1]) {
								d3.select(this).style("opacity", 0.5);
						}
					});
				}
				
				d3.event.stopPropagation();
			})
		.on("mouseout", function(d) {
				d3.select("#matrix").selectAll("rect").style("opacity",1.0);
				
				if(barchartHover)
				{
					svg.selectAll("rect").each(function(d) {
						if(cluster != d[0][1]) {
								d3.select(this).style("opacity", 1.0);
						}
					});
				}
				
				d3.event.stopPropagation();
			});

	console.log("Barchart done");
}
