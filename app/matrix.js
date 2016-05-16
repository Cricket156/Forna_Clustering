function doMatrix() {

	var svg = d3.select("#matrix");

	var gewichtungen = [1,1,1];

	/*var getColor = function(x,y,z) {
		var result=0;
		for(var i=0;i<gewichtungen.length;++i)
			result+=gewichtungen[i]*x


	}*/

	var colorRange=d3.scale.linear().
			domain([d3.min(results,function(d){return gewichtungen[0]*d[2]+gewichtungen[1]*d[3]+gewichtungen[2]*d[4];}),
				d3.max(results,function(d){return gewichtungen[0]*d[2]+gewichtungen[1]*d[3]+gewichtungen[2]*d[4];})])
			.range(["green","red"]);	

	//Iwo muss gespeichert sein, wie die StepSize beim Generieren war (oder iwie ausrechnen
	var stepSizes = [0.2,6.0,6.0];

	for(var i=0;i<3;++i)
	{

		var iLowerRange=d3.min(results,function(d){return parseFloat(d[5+i]);});
		var iUpperRange=parseFloat(d3.max(results,function(d){return d[5+i];}))+stepSizes[i];
		var iRange=d3.scale.linear().domain([iLowerRange,iUpperRange]).range([0,100]);
		var iStepSize=iRange(iLowerRange+stepSizes[i]);

//		console.log(iLowerRange);
//		console.log(iUpperRange);

		for(var j=i+1;j<3;++j)
		{
			var visible = [];
			visible.push(results[0]);
	
			for(var k=1;k<results.length;++k)
			{
				var v=false;

				for(var l=0;l<visible.length;++l)
				{
					if(visible[l][5+i]==results[k][5+i] && visible[l][5+j]==results[k][5+j])
					{
						v=true;
						if(gewichtungen[0]*results[k][2]+gewichtungen[1]*results[k][3]+gewichtungen[2]*results[k][4]<gewichtungen[0]*visible[l][2]+gewichtungen[1]*visible[l][3]+gewichtungen[2]*visible[l][4])
							visible[l]=results[k];
						break;
					}
				}

				if(!v)
					visible.push(results[k]);
			}

			console.log(visible.length);

			var group1 = svg.append("g");

			var jLowerRange=d3.min(visible,function(d){return parseFloat(d[5+j]);});
                	var jUpperRange=parseFloat(d3.max(visible,function(d){return d[5+j];}))+stepSizes[j];
        	        var jRange=d3.scale.linear().domain([jLowerRange,jUpperRange]).range([0,100]);
	                var jStepSize=jRange(jLowerRange+stepSizes[j]);

//			console.log(jLowerRange);
//			console.log(jUpperRange);

			var squares = group1.selectAll("rect")
				.data(visible)
				.enter().append("rect")
				.attr("x",function(d){
						return iRange(d[5+i]);
					})
				.attr("y",function(d){
       	       	                		return jRange(d[5+j]);
		                       	})
				.attr("width",iStepSize)
				.attr("height",jStepSize)
				.style("fill",function(d){
                       	        		return colorRange(gewichtungen[0]*d[2]+gewichtungen[1]*d[3]+gewichtungen[2]*d[4]);
					});

			group1.attr("transform","translate(" + i*130 + "," + (j-1)*130 + ")");
		}
	}
	
	/*svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 20);

	console.log("Matrix done");*/
}
