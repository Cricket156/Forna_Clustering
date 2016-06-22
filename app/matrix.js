var clusterColors = [];

function doMatrix() {
	
	var beschreibung = "This Heat-Map-Matrix shows 'good' (light colors) and 'bad' (dark colors) Visualizations based on their Penalty-Sum. Hovering over one Square highlights the Node in the other Heat-Maps as well as the corresponding Line in the Parallel Coordinates. By Clicking on one Square, the Visualization behind is shown. Click on this Visualization to open it in an new window. Maximize a particular Map with the maximize Button.";
	
	var svg = d3.select("#matrix");
	var svg_direct = svg;

	svg.selectAll(".new").remove();
	svg.selectAll(".max").remove();
	svg.selectAll(".close").remove();
	
	if(!matrixloaded)
	{
		svg = svg.append("g");
		for(var i=anzahlPenalties+2;i<columnnames.length-1;++i)
			for(var j=i+1;j<columnnames.length-1;++j)
				var group1 = svg.append("g")
                			.attr("class","c"+i+"-"+j);
		matrixloaded=true;
	}
	else
		svg = svg.select("g");

	svg.selectAll("g").selectAll(".axis").remove();

	var marginSide = 40,
		marginBottom = 20,
		marginTop = 20;

	var width = document.getElementById('matrixDiv').clientWidth;
	var height = (window.innerHeight-60)*(2/3);

	var div = d3.select("body").append("div")	
		.attr("class", "tooltipLarge")				
		.style("opacity", 0);
		
	svg_direct.attr("width", width)
		.attr("height", width)
		.on("mouseover", function(d) {
			//writeBarchartText();
			d3.select("#fixedTooltipDiv")
				.select("p")
				.text(beschreibung);
		})
		.on("mouseout", function(d) {
			d3.select("#fixedTooltipDiv")
				.select("p")
				.text("");
		});

	width = width - marginSide - marginSide;
	height = height - marginBottom - marginTop;

	svg.attr("transform", "translate(" + marginSide + "," + marginTop + "),scale("+width/((marginSide + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1)))+","+width/((marginTop + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1)))+")");

	//Iwo muss gespeichert sein, wie die StepSize beim Generieren war (oder iwie ausrechnen)
	var stepSizes = [];
	stepSizes.push(0);
	stepSizes.push(0);
	
	//for(var i=0;i<(anzahlPenalties+2);++i)
	//	stepSizes.push(0);

	for(var i=2;i<columnnames.length-1;++i)
	{
		min1 = d3.min(original_results,function(d) {
				return d[i];
			});
		min2 = d3.min(original_results,function(d) {
				if(d[i]>min1)
					return d[i];
				});
		
		if(isNaN(min2))
			stepSizes.push(0);
		else
			stepSizes.push(min2-min1);
	}

	var avgType=false;

	var getAvgPenalty = function(d) {
		var result=0;
		for(var i=0;i<gewichtungen.length;++i)
			result+=gewichtungen[i]*d[2+i];
		return result;
	}

	var drawDatapoints = function(data,i,j,new_group,isScatterplot) {

		var iLowerRange=d3.min(original_results,function(d){return parseFloat(d[i]);});
		var iUpperRange=parseFloat(d3.max(original_results,function(d){return d[i];}))+stepSizes[i];
		var iRange=d3.scale.linear().domain([iLowerRange,iUpperRange]).range([0,100]);
		var iStepSize=iRange(iLowerRange+stepSizes[i]);
		
		var jLowerRange=d3.min(original_results,function(d){return parseFloat(d[j]);});
		var jUpperRange=parseFloat(d3.max(original_results,function(d){return d[j];}))+stepSizes[j];
		var jRange=d3.scale.linear().domain([jLowerRange,jUpperRange]).range([0,100]);
		var jStepSize=jRange(jLowerRange+stepSizes[j]);
		
		var xaxis = d3.svg.axis()
			.scale(iRange)
			.orient("bottom")
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

		var squares;
		
		if(isScatterplot)
		{	
			squares = group1.selectAll(".dot")
				.data(data)
				.enter().append("circle")
				.attr("class", "dot")
				.attr("r", 3.5)
				.attr("cx", function(d) { return iRange(d[i]); })
				.attr("cy", function(d) { return jRange(d[j]); })
				.style("opacity",0.2)
				.style("fill", function(d, i) {
						if(-1==d[1])
						{
							if (document.getElementById("inputCheckbox").checked) {
								d3.select(this).style("opacity", 0.0);
							}
							else
							{
								return "black";
							}
						}
						else
						{
							return clusterColors[(results[i][1])];
						}
					});
		}
		else
		{
			squares = group1.selectAll("rect").data(visible);
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
				
				squares.exit().remove();
		}

		var w = 100; // heatmap width
		group1.append("g")
			.attr("class", "xaxis axis")
			.attr("transform", "translate(0," + w + ")")
			.call(xaxis)
			.append("text")
		//	.attr("class", "label")
			.attr("y", 30)
			.attr("x", w/2)
			.style("text-anchor", "middle")
			.text(String(columnnames[i]));

		group1.append("g")
			.attr("class", "yaxisleft axis")
			.call(yaxisleft)
			.append("text")
		//	.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", -35)
			.attr("x", -(w/2))
			.attr("dy", ".71em")
			.style("text-anchor", "middle")
			.text(String(columnnames[j]));
			
		var group_max = group1.append("g").attr("class","max");
		
		group_max.append('image').attr('xlink:href','maximize.svg')
			.attr('height', 15)
			.attr('width', 15)
			.attr('x',-15)
			.attr('y',100)
			.on("click",function(d) {
				heatmapfilteri=i;
				heatmapfilterj=j;
				doMatrix();
			});

		squares.on("click",function(d) {
				showSVG(d, svg_direct);
			})
		.on("mouseover",function(d) {
				d3.selectAll(".r"+d[0]).style("stroke", "white").style("stroke-width",4);
				d3.selectAll(".p"+d[0]).style("stroke-width",3);
				d3.event.stopPropagation();
				
				div.transition()		
					.duration(200)		
					.style("opacity", .9);
					
				div.html(function() {
						var text = "";
						for (var j = 0; j < columnnames.length-1; j++) {
							text = text + columnnames[j] + ": " + d[j] + "<br>";
						}
						return text;
					})	
					.style("left", (d3.event.pageX) + "px")		
					.style("top", (d3.event.pageY - 28) + "px");
					
				d3.select("#fixedTooltipDiv")
					.select("p")
					.text(beschreibung);
			})
		.on("mouseout",function(d) {
				d3.selectAll(".r"+d[0]).style("stroke", "none");
				d3.selectAll(".p"+d[0]).style("stroke-width",1);
				d3.event.stopPropagation();
				
				div.transition()		
						.duration(500)		
						.style("opacity", 0);
						
				d3.select("#fixedTooltipDiv")
					.select("p")
					.text("");
			});

		if(!new_group)
			group1.attr("transform","translate(" + (marginSide + (i-(anzahlPenalties+2))*(100+marginSide)) + "," + (marginTop + (j-1-(anzahlPenalties+2))*(100+marginSide)) + ")");

	}

	var colorRange=d3.scale.linear().
			domain([d3.min(results,function(d){return getAvgPenalty(d);}),
				d3.max(results,function(d){return getAvgPenalty(d);})])
			.range([heatmapcolors[0],heatmapcolors[1]]);

	var drawHeatmaps = function(data)
	{
		svg.selectAll(".close").remove();
		svg.selectAll(".max").remove();
		
		var new_heatmap=true;

		for(var i=anzahlPenalties+2;i<columnnames.length-1;++i)
		{
			if((-1==heatmapfilteri || -1==heatmapfilterj) || i==heatmapfilteri)
			{
				for(var j=i+1;j<=columnnames.length-1;++j)
				{
					if((-1==heatmapfilteri || -1==heatmapfilterj) || j==heatmapfilterj)
					{
						new_heatmap=false;

						drawDatapoints(data,i,j,new_heatmap,false)
					}
				}
			}
		}

		if(-1!=heatmapfilteri && -1!=heatmapfilterj)
		{
			svg.selectAll(".max").remove();
			
			var group_close = svg.append("g").attr("class","close");
		
			group_close.append('image').attr('xlink:href','minimize.svg')
				.attr('height', 30)
				.attr('width', 30)
				.attr('x',0)
				.attr('y',0)
				.style("opacity", 1.0)
				.on("click",function(d) {
					resetMatrixFilter();
				});
		
			if(heatmapfilterj<(anzahlPenalties+2))
			{
				d3.select("#outlierCheckbox")
					.style("visibility", "visible");
				svg.selectAll("*").selectAll("rect").remove();
				svg.selectAll("*").selectAll(".xaxis").remove();
				svg.selectAll("*").selectAll(".yaxisleft").remove();
			
				drawDatapoints(data,heatmapfilteri,heatmapfilterj,true,true);
				
				var group = svg.select(".new");
				group.attr("transform","scale(" + ((marginSide + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1))/(100+marginSide)) + "," + ((marginTop + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1))/(100+marginSide)) + "),translate(" + marginSide + "," + marginTop + ")");
			}
			else
			{
				d3.select("#outlierCheckbox")
					.style("visibility", "hidden");
				if(new_heatmap)
				{
					svg.selectAll("*").selectAll("rect").remove();
					svg.selectAll("*").selectAll(".xaxis").remove();
					svg.selectAll("*").selectAll(".yaxisleft").remove();
					
					drawDatapoints(data,heatmapfilteri,heatmapfilterj,true,false);
					var group = svg.select(".new");
					group.attr("transform","scale(" + ((marginSide + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1))/(100+marginSide)) + "," + ((marginTop + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1))/(100+marginSide)) + "),translate(" + marginSide + "," + marginTop + ")");
				}
				else
				{
					svg.selectAll("*:not(.c"+heatmapfilteri+"-"+heatmapfilterj+")").selectAll("rect").remove();
					svg.selectAll("*:not(.c"+heatmapfilteri+"-"+heatmapfilterj+")").selectAll(".xaxis").remove();
					svg.selectAll("*:not(.c"+heatmapfilteri+"-"+heatmapfilterj+")").selectAll(".yaxisleft").remove();
					
					var group = svg.selectAll(".c"+heatmapfilteri+"-"+heatmapfilterj);
					group.attr("transform","scale(" + ((marginSide + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1))/(100+marginSide)) + "," + ((marginTop + (100+marginSide)*(columnnames.length-1-(anzahlPenalties+2)-1))/(100+marginSide)) + "),translate(" + marginSide + "," + marginTop + ")");
					//group.transition().duration(1000).attr("transform","scale(2,2)");
				}
			}
			
			svg.selectAll(".axis").style("font","5px sans-serif");
		}

	};

	var drawMatrix = function() {
		var clusterposition;
		
		for(var i=0;i<clusters.length;++i)
		{
			if(clusters[i][0][1]==matrixfilter)
				clusterposition=i;
		}
		
		if(-1==matrixfilter)
			drawHeatmaps(results);
		else
			drawHeatmaps(clusters[clusterposition]);
	};
	
	drawMatrix();

	d3.select("body").select("#ChangeMatrix")
        .on("click", function(d) {
                avgType=!avgType;
				if (avgType) {
					d3.select("#ChangeMatrix").attr("value", "Change to best");
				}
				else {
					d3.select("#ChangeMatrix").attr("value", "Change to worst");
				}
				drawMatrix();
        });

	console.log("Matrix done");
}

function randomColorGenerator() {
	for (var i = 0; i < clusters.length; i++) {
		var color = "#"+((1<<24)*Math.random()|0).toString(16);
		if (color.length < 7) {
			color = "#"+((1<<24)*Math.random()|0).toString(16);
		}
		clusterColors.push(color);
	}
}
