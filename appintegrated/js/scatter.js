function doScatter() {



	var svg = d3.select("#scatter");
	var svg_direct = svg;
	var color = d3.scale.category10();
  var clusterlengtharray = [];
	// produce array with only penalties


	svg.select(".new").remove();

	if(!scatterloaded)
	{
		svg = svg.append("g");
		for(var i=5;i<columnnames.length-1;++i)
			for(var j=i+1;j<columnnames.length-1;++j)
				var group2 = svg.append("g")
                			.attr("class","c"+i+"-"+j);
		scatterloaded=true;
	}
	else
		svg = svg.select("g");

	svg.selectAll("g").selectAll(".axis").remove();

	var marginSide = 10,
		marginBottom = 10,
		marginTop = 10;

	var width = document.getElementById('scatterDiv').clientWidth;
	var height = (window.innerHeight-60)*(2/3);

	svg_direct.attr("width", width)
		.attr("height", width);

	width = width - marginSide - marginSide;
	height = height - marginBottom - marginTop;

	svg.attr("transform", "translate(" + marginSide + "," + marginTop + "),scale("+width/((20 + 130*(columnnames.length-1-5-1)))+","+width/((20 + 130*(columnnames.length-1-5-1)))+")");

	//Iwo muss gespeichert sein, wie die StepSize beim Generieren war (oder iwie ausrechnen)
	var stepSizes = [0,0,1,1,1];

	for(var i=0;i<columnnames.length-1;++i)
	{
		min1 = d3.min(results,function(d) {
				return d[5+i];
			});
		min2 = d3.min(results,function(d) {
				if(d[5+i]>min1)
					return d[5+i];
			});
		stepSizes.push(min2-min1);
	}

	var avgType=true;

	var gewichtungen = [1,1,1];

	var getAvgPenalty = function(d) {
		var result=0;
		for(var i=0;i<gewichtungen.length;++i)
			result+=gewichtungen[i]*d[2+i];
		return result;
	}

	var drawPoints = function(data,i,j,new_group) {

		var iLowerRange=d3.min(data,function(d){return parseFloat(d[i]);});
		var iUpperRange=parseFloat(d3.max(data,function(d){return d[i];}))+stepSizes[i];
		var iRange=d3.scale.linear().domain([iLowerRange,iUpperRange]).range([0,100]);
		var iStepSize=iRange(iLowerRange+stepSizes[i]);

		var jLowerRange=d3.min(data,function(d){return parseFloat(d[j]);});
		var jUpperRange=parseFloat(d3.max(data,function(d){return d[j];}))+stepSizes[j];
		var jRange=d3.scale.linear().domain([jLowerRange,jUpperRange]).range([0,100]);
		var jStepSize=jRange(jLowerRange+stepSizes[j]);

		var xaxis = d3.svg.axis()
			.scale(iRange)
			.orient("top")
			.ticks(5);

		var yaxisleft = d3.svg.axis()
			.scale(jRange)
			.orient("left")
			.ticks(5);

		var visible = [];
		visible.push(data[0]);

		for(var k=1;k<data.length;++k)
		{
			var v=false;

			for(var l=0;l<visible.length;++l)
			{
				if(visible[l][i]==data[k][i] && visible[l][j]==data[k][j])
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

//						console.log(iStepSize);
//						console.log(jStepSize);

		var group2;

		if(new_group)
		{
			svg.append("g").attr("class","new");
			group2 = svg.select(".new");
		}
		else
		{
			group2 = svg.select(".c"+i+"-"+j);
		}

		if(j>=5)
		{

			var squares = group2.selectAll("circle").data(visible);
			squares.style("fill",function(d){
					return colorRange(getAvgPenalty(d));
				});
			squares.enter().append("circle")
				.style("fill",function(d){
						return colorRange(getAvgPenalty(d));
					});
			squares.attr("class",function(d){
						return "r"+d[0]+" i"+i+" j"+j;
					})
				.attr("x",function(d){
						return iRange(d[i]);
					})
				.attr("y",function(d){
										return jRange(d[j]);
								})
				.attr("width",iStepSize)
				.attr("height",jStepSize);

			group2.append("g")
				.attr("class", "xaxis axis")
				.call(xaxis);

			group2.append("g")
				.attr("class", "yaxisleft axis")
				.call(yaxisleft);

			squares.on("click",function(d) {
					showSVG(d, svg_direct);
				})
			.on("mouseover",function(d) {
					d3.selectAll(".r"+d[0]).style("stroke", "white");
					d3.event.stopPropagation();
				})
			.on("mouseout",function(d) {
					d3.selectAll(".r"+d[0]).style("stroke", "none");
					d3.event.stopPropagation();
				});

			squares.exit().remove();

		}
		else
		{
			console.log("test");
			var circles = group2.selectAll("circle").data(visible);
			circles.style("fill",function(d){
					return colorRange(getAvgPenalty(d));
				});
			circles.enter().append("circle")
				.style("fill",function(d){
						return colorRange(getAvgPenalty(d));
					});
			circles.attr("class",function(d){
						return "r"+d[0]+" i"+i+" j"+j;
					})
				.attr("cx",function(d){
						return iRange(d[i]);
					})
				.attr("cy",function(d){
						return jRange(d[j]);
					})
				.attr("r",function(d) {
							if(jStepSize<iStepSize)
								return jStepSize/4;
							else
								return iStepSize/4;
					});


			 circles.exit().remove();
		}

		if(!new_group)
			group2.attr("transform","translate(" + (20 + (i-5)*130) + "," + (20 + (j-1-5)*130) + ")");

	}

	var colorRange=d3.scale.linear().
			domain([d3.min(results,function(d){return getAvgPenalty(d);}),
				d3.max(results,function(d){return getAvgPenalty(d);})])
			.range(["green","red"]);

	var drawscatters = function(data)
	{
		var new_scatter=true;

		for(var i=5;i<columnnames.length-1;++i)
		{
			if((-1==scatterfilteri || -1==scatterfilterj) || i==scatterfilteri)
			{

//				console.log(iLowerRange);
//				console.log(iUpperRange);

				// for(var j=i+1;j<columnnames.length-1;++j)
				// {
				// 	if((-1==scatterfilteri || -1==scatterfilterj) || j==scatterfilterj)
				// 	{
				// 		new_scatter=false;
				//
				// 		drawPoints(data,i,j,false)
				// 	}
				// }
			}
		}

		if(-1!=scatterfilteri && -1!=scatterfilterj)
		{

			if(scatterfilterj<5)
			{
				svg.selectAll("*").selectAll(".circle").remove();
				svg.selectAll("*").selectAll(".xaxis").remove();
				svg.selectAll("*").selectAll(".yaxisleft").remove();

				svg.append("g").attr("class","new");
				group2 = svg.select(".new");

				var i=scatterfilteri;
				var j=scatterfilterj;
				console.log(i);

				var iLowerRange=d3.min(data,function(d){return parseFloat(d[i]);});
				var iUpperRange=parseFloat(d3.max(data,function(d){return d[i];}))+stepSizes[i];
				var iRange=d3.scale.linear().domain([iLowerRange,iUpperRange]).range([0,100]);
				var iStepSize=iRange(iLowerRange+stepSizes[i]);

				var jLowerRange=d3.min(data,function(d){return parseFloat(d[j]);});
				var jUpperRange=parseFloat(d3.max(data,function(d){return d[j];}))+stepSizes[j];
				var jRange=d3.scale.linear().domain([jLowerRange,jUpperRange]).range([0,100]);
				var jStepSize=jRange(jLowerRange+stepSizes[j]);

				var xaxis = d3.svg.axis()
					.scale(iRange)
					.orient("top")
					.ticks(5);

				var yaxisleft = d3.svg.axis()
					.scale(jRange)
					.orient("left")
					.ticks(5);

				group2.append("g")
					.attr("class", "xaxis axis")
					.call(xaxis)
					.append("text")
		      .attr("class", "label")
		      .attr("x", width+40)
		      .attr("y", 20)
		      .style("text-anchor", "beginn")
		      .text(String(columnnames[i]));

//TODO: die sichtbare ist die y achse
				group2.append("g")
					.attr("class", "yaxisleft axis")
					.call(yaxisleft)
					.append("text")
			    .attr("class", "label")
			    .attr("transform", "rotate(-90)")
			    .attr("y", 40)
			    .attr("dy", ".71em")
			    .style("text-anchor", "end")
			    .text(String(columnnames[j]));

				//Scatterplot
				//alles, was mit dem scatterplot zu tun hat, kommt in group2
				//Die daten für die x-Achse stehen an der stelle i, die für die y-Achse stehen an der Stelle j


						var circles =	group2.selectAll(".circle")
																			.data(data)
																			.enter().append("circle")
																			.attr("class", "dot")
																			.attr("r", 1.5)
																			.attr("cx", function(d, x) { return iRange(d[i])+ (Math.random()*5); })
																			.attr("cy", function(d, x) { return jRange(d[j]) + (Math.random()*5); })
																			.style("opacity", 0.2)
																			.style("fill",function(d){
																				// coloring according to cluster
																			return	colorRange(getAvgPenalty(d));
																				});


				group2.attr("transform","scale(" + ((20 + 130*(columnnames.length-1-5-1))/130) + "," + ((20 + 130*(columnnames.length-1-5-1))/130) + "),translate(20,20)");
			}
			else
			{
				if(new_scatter)
				{
					svg.selectAll("*").selectAll(".circle").remove();
					svg.selectAll("*").selectAll(".xaxis").remove();
					svg.selectAll("*").selectAll(".yaxisleft").remove();

					drawPoints(data,scatterfilteri,scatterfilterj,true);
					var group = svg.select(".new");
					group.attr("transform","scale(" + ((20 + 130*(columnnames.length-1-5-1))/130) + "," + ((20 + 130*(columnnames.length-1-5-1))/130) + "),translate(20,20)");

				}
				else
				{
					svg.selectAll("*:not(.c"+scatterfilteri+"-"+scatterfilterj+")").selectAll("rect").remove();
					svg.selectAll("*:not(.c"+scatterfilteri+"-"+scatterfilterj+")").selectAll(".xaxis").remove();
					svg.selectAll("*:not(.c"+scatterfilteri+"-"+scatterfilterj+")").selectAll(".yaxisleft").remove();

					var group = svg.selectAll(".c"+scatterfilteri+"-"+scatterfilterj);
					group.attr("transform","scale(" + ((20 + 130*(columnnames.length-1-5-1))/130) + "," + ((20 + 130*(columnnames.length-1-5-1))/130) + "),translate(20,20)");
					//group.transition().duration(1000).attr("transform","scale(2,2)");
				}


			}
		}

	};

	if(-1==scatterfilter)
		drawscatters(results);
	else
		drawscatters(clusters[scatterfilter]);

	d3.select("body").select("#Changescatter")
        .on("click", function(d) {
                avgType=!avgType;
		if(-1==scatterfilter)
				drawscatters(results);
		else
				drawscatters(clusters[scatterfilter]);
        });

	console.log("scatter done");
}
