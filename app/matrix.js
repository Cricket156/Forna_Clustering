function doMatrix() {

	var svg = d3.select("#matrix");

	//TODO Bessere Moeglichkeit? (button wird dadurch nicht geloescht, vl eher im handler.js?)
	//svg.selectAll("*").remove();

	var avgType=true;

	var gewichtungen = [1,1,1];

	var getAvgPenalty = function(d) {
		var result=0;
		for(var i=0;i<gewichtungen.length;++i)
			result+=gewichtungen[i]*d[2+i];
		return result;
	}

	var colorRange=d3.scale.linear().
			domain([d3.min(results,function(d){return getAvgPenalty(d);}),
				d3.max(results,function(d){return getAvgPenalty(d);})])
			.range(["green","red"]);	

	//Iwo muss gespeichert sein, wie die StepSize beim Generieren war (oder iwie ausrechnen)
	var stepSizes = [0.2,6.0,6.0];

	if(!matrixloaded)
	{
		for(var i=0;i<3;++i)
			for(var j=i+1;j<3;++j)
				var group1 = svg.append("g")
                			.attr("class","c"+i+"-"+j);	
		matrixloaded=true;
	}

	var drawHeatmaps = function(data)
	{
		for(var i=0;i<3;++i)
		{
			if(-1==heatmapfilteri || i==heatmapfilteri)
			{
				var iLowerRange=d3.min(data,function(d){return parseFloat(d[5+i]);});
				var iUpperRange=parseFloat(d3.max(data,function(d){return d[5+i];}))+stepSizes[i];
				var iRange=d3.scale.linear().domain([iLowerRange,iUpperRange]).range([0,100]);
				var iStepSize=iRange(iLowerRange+stepSizes[i]);

//				console.log(iLowerRange);
//				console.log(iUpperRange);

				for(var j=i+1;j<3;++j)
				{
					if(-1==heatmapfilterj || j==heatmapfilterj)
					{
						var visible = [];
						visible.push(data[0]);
	
						for(var k=1;k<data.length;++k)
						{
							var v=false;

							for(var l=0;l<visible.length;++l)
							{
								if(visible[l][5+i]==data[k][5+i] && visible[l][5+j]==data[k][5+j])
								{
									v=true;

									if(avgType)
										if(getAvgPenalty(data[k])<getAvgPenalty(visible[l]))
											visible[l]=data[k];
									else
										if(getAvgPenalty(data[k])>getAvgPenalty(visible[l]))
                	        		                                        visible[l]=data[k];
									break;
								}
							}

							if(!v)
								visible.push(data[k]);
						}

						var jLowerRange=d3.min(data,function(d){return parseFloat(d[5+j]);});
		        	        	var jUpperRange=parseFloat(d3.max(data,function(d){return d[5+j];}))+stepSizes[j];
        				        var jRange=d3.scale.linear().domain([jLowerRange,jUpperRange]).range([0,100]);
	                			var jStepSize=jRange(jLowerRange+stepSizes[j]);

						console.log(iStepSize);
						console.log(jStepSize);

						var group1 = svg.selectAll(".c"+i+"-"+j);

						if(rangeschanged)
							group1.selectAll("rect").remove();

						var squares = group1.selectAll("rect").data(visible);
						squares.enter().append("rect")
							.attr("class",function(d){
									return "r"+d[0];
								})
							.attr("x",function(d){
									return iRange(d[5+i]);
								})
							.attr("y",function(d){
       		       	        		        		return jRange(d[5+j]);
					                       	})
							.attr("width",iStepSize)
							.attr("height",jStepSize)
							.style("fill","white");

						squares.transition().duration(1000)
							.style("fill",function(d){
									//console.log(getAvgPenalty(d))
        	               	        				return colorRange(getAvgPenalty(d));
								});
						squares.on("click",function(d) {
								var group = svg.append("g").attr("class","vis");

								//console.log("hallo");
								group.append("rect")
									.attr("class","details")
									.attr("x",0)
									.attr("y",0)
									.attr("width",400)
									.attr("height",300)
									.attr("fill","yellow");

								/*d3.xml("close.svg", "image/svg+xml", function(error, xml) {
										if (error) throw error;

										var svgNode = xml
                                                                                .getElementsByTagName("svg")[0];

                                                                        	svg.node().appendChild(svgNode);

                                                                        	svg.select("#Capa_1")
											.attr("transform","translate(365,10),scale(0.05,0.05)")
											.select("path").on("click",function(d){
													console.log("test");
												});
									});*/

								d3.xml("svg1.svg", "image/svg+xml", function(error, xml) {
										if (error) throw error;

										var svgNode = xml
                                                                                .getElementsByTagName("svg")[0];

                                                                        	svg.node().appendChild(svgNode);

                                                                        	svg.select("#plotting-area").select("g")
											.attr("transform","scale(0.5,0.5)")
											.on("click",function(d) {
                                                                                 		window.open("./svg1.svg");
                                                                                });
									});

								var group_new_window = group.append("g").attr("class","new_window");

								group_new_window.append("rect")
									.attr("class","vis_rect")
									.attr("x",10)
									.attr("y",10)
									.attr("width",200)
									.attr("height",280)
									.attr("fill","white")
									.on("click",function(d) {
											console.log("test");
											window.open("./svg1.svg");
										});

								var group_close = group.append("g").attr("class","close");

								group_close.append('image')
									.attr('xlink:href','close.jpg')
									.attr('height', 20)
									.attr('width', 20)
									.on("click",function(d) {
											svg.select("#plotting-area").remove();
											svg.selectAll(".vis").remove();
										});

								group_close.attr("transform","translate(370,7)");

								group.append("text")
									.attr("x",250)
									.attr("y",50)
									.text("Overlaps: " + d[2]);

								group.append("text")
									.attr("x",250)
									.attr("y",65)
									.text("Stretches: " + d[3]);

								group.append("text")
									.attr("x",250)
									.attr("y",80)
									.text("Position: " + d[4]);

								group.append("text")
                                                                        .attr("x",250)
                                                                        .attr("y",95)
                                                                        .text("Cluster: " + d[1]);

								group.append("text")
                                                                        .attr("x",250)
                                                                        .attr("y",120)
                                                                        .text("parameter1: " + d[5]);

								group.append("text")
                                                                        .attr("x",250)
                                                                        .attr("y",135)
                                                                        .text("parameter2: " + d[6]);

								group.append("text")
                                                                        .attr("x",250)
                                                                        .attr("y",150)
                                                                        .text("parameter3: " + d[7]);

								group.append("text")
                                                                        .attr("x",250)
                                                                        .attr("y",180)
                                                                        .text("Nummer: " + d[0]);

								d3.event.stopPropagation();
							})
							.on("mouseover",function(d) {
									d3.selectAll(".r"+d[0]).style("stroke", "white");
								d3.event.stopPropagation();
							})
							.on("mouseout",function(d) {
		                                                d3.selectAll(".r"+d[0]).style("stroke", "none");
                		                                d3.event.stopPropagation();
                                		        });

						group1.attr("transform","translate(" + i*130 + "," + (j-1)*130 + ")");

						squares.exit().remove();

					}
				}
			}
		}
		
		if(-1!=heatmapfilteri && -1!=heatmapfilterj)
		{
			var group = svg.selectAll(".c"+heatmapfilteri+"-"+heatmapfilterj);
			group.transition().duration(1000).attr("transform","scale(4,4)");
		}

	};

	if(-1==matrixfilter)
		drawHeatmaps(results);
	else
		drawHeatmaps(clusters[matrixfilter]);

	d3.select("body").append("input")
        .attr("value", "Change AvgPenalty")
        .attr("type", "button")
        .attr("class", "dataset-button")
        .on("click", function(d) {
                avgType=!avgType;
		if(-1==matrixfilter)
	                drawHeatmaps(results);
        	else
                	drawHeatmaps(clusters[matrixfilter]);
        });
	
	/*svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);
*/
	console.log("Matrix done");
}
