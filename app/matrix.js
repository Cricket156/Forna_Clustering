function doMatrix() {

	var svg = d3.select("#matrix");
	var svg_direct = svg;
	
	svg.select(".new").remove();
	
	if(!matrixloaded)
	{
		svg = svg.append("g");
		for(var i=5;i<8;++i)
			for(var j=i+1;j<8;++j)
				var group1 = svg.append("g")
                			.attr("class","c"+i+"-"+j);	
		matrixloaded=true;
	}
	else
		svg = svg.select("g");
	
	var marginSide = 10,
		marginBottom = 10,
		marginTop = 10;
	
	var width = document.getElementById('matrixDiv').clientWidth;
	var height = (window.innerHeight-60)*(2/3);
	
	svg_direct.attr("width", width)
		.attr("height", width);
		
	svg.attr("transform", "scale("+width/((130*(columnnames.length-1-5-1)))+","+width/((130*(columnnames.length-1-5-1)))+")");
	
	//Iwo muss gespeichert sein, wie die StepSize beim Generieren war (oder iwie ausrechnen)
	var stepSizes = [0,0,1,1,1];
	
	for(var i=0;i<3;++i)
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
	
	var drawRectangles = function(data,i,j,new_group) {
		
		var iLowerRange=d3.min(data,function(d){return parseFloat(d[i]);});
		var iUpperRange=parseFloat(d3.max(data,function(d){return d[i];}))+stepSizes[i];
		var iRange=d3.scale.linear().domain([iLowerRange,iUpperRange]).range([0,100]);
		var iStepSize=iRange(iLowerRange+stepSizes[i]);
			
		var jLowerRange=d3.min(data,function(d){return parseFloat(d[j]);});
		var jUpperRange=parseFloat(d3.max(data,function(d){return d[j];}))+stepSizes[j];
		var jRange=d3.scale.linear().domain([jLowerRange,jUpperRange]).range([0,100]);
		var jStepSize=jRange(jLowerRange+stepSizes[j]);
	
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

		var group1;

		if(new_group)
		{
			svg.append("g").attr("class","new");
			group1 = svg.select(".new");
		}
		else
		{
			group1 = svg.select(".c"+i+"-"+j);
		}

		if(j>=5)
		{
		
			var squares = group1.selectAll("rect").data(visible);
			squares.style("fill",function(d){
					return colorRange(getAvgPenalty(d));
				});
			squares.enter().append("rect")
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
													

			squares.on("click",function(d) {
					var group = svg_direct.append("g").attr("class","vis");

					group.append("rect")
						.attr("class","details")
						.attr("x",0)
						.attr("y",0)
						.attr("width",400)
						.attr("height",300)
						.attr("fill","yellow");

					d3.xml("svg1.svg", "image/svg+xml", function(error, xml) {
							if (error) throw error;

							var svgNode = xml
																	.getElementsByTagName("svg")[0];

																svg_direct.node().appendChild(svgNode);

																svg_direct.select("#plotting-area").select("g")
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
								window.open("./svg1.svg");
							});

					var group_close = group.append("g").attr("class","close");

					group_close.append('image')
						.attr('xlink:href','close.jpg')
						.attr('height', 20)
						.attr('width', 20)
						.on("click",function(d) {
								svg_direct.select("#plotting-area").remove();
								svg_direct.selectAll(".vis").remove();
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

			squares.exit().remove();
									
		}
		else
		{
			console.log("test");
			var circles = group1.selectAll("circle").data(visible);
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
			group1.attr("transform","translate(" + (i-5)*130 + "," + (j-1-5)*130 + ")");
		
	}
	
	var colorRange=d3.scale.linear().
			domain([d3.min(results,function(d){return getAvgPenalty(d);}),
				d3.max(results,function(d){return getAvgPenalty(d);})])
			.range(["green","red"]);

	var drawHeatmaps = function(data)
	{
		var new_heatmap=true;
		
		for(var i=5;i<8;++i)
		{
			if((-1==heatmapfilteri || -1==heatmapfilterj) || i==heatmapfilteri)
			{

//				console.log(iLowerRange);
//				console.log(iUpperRange);

				for(var j=i+1;j<8;++j)
				{
					if((-1==heatmapfilteri || -1==heatmapfilterj) || j==heatmapfilterj)
					{
						new_heatmap=false;
						
						drawRectangles(data,i,j,false)
					}
				}
			}
		}
	
		if(-1!=heatmapfilteri && -1!=heatmapfilterj)
		{
			if(new_heatmap)
			{
				svg.selectAll("*").selectAll("rect").remove();
				
				drawRectangles(data,heatmapfilteri,heatmapfilterj,true);
				var group = svg.select(".new");
				group.attr("transform","scale(2.5,2.5)");
				
			}
			else
			{
				svg.selectAll("*:not(.c"+heatmapfilteri+"-"+heatmapfilterj+")").selectAll("rect").remove();
				
				var group = svg.selectAll(".c"+heatmapfilteri+"-"+heatmapfilterj);
				group.attr("transform","scale(2.5,2.5)");
				//group.transition().duration(1000).attr("transform","scale(2,2)");
			}
		}

	};

	if(-1==matrixfilter)
		drawHeatmaps(results);
	else
		drawHeatmaps(clusters[matrixfilter]);

	d3.select("body").select("#ChangeMatrix")
        .on("click", function(d) {
                avgType=!avgType;
		if(-1==matrixfilter)
				drawHeatmaps(results);
		else
				drawHeatmaps(clusters[matrixfilter]);
        });

	console.log("Matrix done");
}
