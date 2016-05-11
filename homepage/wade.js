

var legend1_scale = d3.scale.ordinal()
  .domain(["CS", "ECON", "MATH", "PSYC"])
  .range([
    "rgb(39, 86, 22)",
    "rgb(206, 8, 116)",
    "rgb(206, 162, 12)",
    "rgb(107, 56, 32)"
  ]);

var legend1_scale_legend = d3.legend.color()
                   .shape('circle')
                   .shapePadding(30)
                   .shapeRadius(8)
                   .orient('horizontal')
                   .scale(legend1_scale);

d3.select("#legend_color")
  .append("g")
  .attr("transform", "translate(20, 20)")
  .call(legend1_scale_legend);

// ============

var legend2_scale = d3.scale.ordinal()
  .domain(["CS", "ECE", "CEE", "ECON", "FIN", "ACCY"])
  .range([
    "rgb(39, 86, 22)",
    "rgb(65, 143, 37)",
    "rgb(75, 135, 4)",
    "rgb(206, 8, 116)",
    "rgb(206, 45, 139)",
    "rgb(255, 124, 195)",
  ]);

var legend2_scale_legend = d3.legend.color()
                   .shape('circle')
                   .shapePadding(30)
                   .shapeRadius(8)
                   .orient('horizontal')
                   .scale(legend2_scale);

d3.select("#legend_colors")
  .append("g")
  .attr("transform", "translate(20, 20)")
  .call(legend2_scale_legend);

// ============

var r_scale = d3.scale.linear()
                .domain([1, 33])
                .range([1, 10]);

var legend_size = d3.legend.size()
                   .shapePadding(10)
                   .orient('horizontal')
                   .labelFormat(d3.format('d'))
                   .labelOffset(15)
                   .shape('circle')
                   .scale(r_scale);

// ==
d3.select("#legend_size")
  .append("g")
  .attr("transform", "translate(10, 10)")
  //.style("fill", "rgb(39, 86, 22)")
  .call(legend_size);


// ========================

$(window).bind("scroll", function() {
  var scroll_top = $(this).scrollTop();
  var points = $(".ga_pvp").each(function() {
    var e = $(this);
    if (!e.data("ga") && scroll_top > e.offset().top) {
      if (e.attr("name") == "Class Hierarchy Visualization") {
        draw_sparse_classes("STEM");
        draw_sparse_classes("LIBARTS");
        draw_sparse_classes("FINEARTS");
        draw_sparse_classes("LANGUAGES");
        matrix();
        tree();
      }
      e.data("ga", true);
      ga('send', 'event', 'scroll', e.attr("name"));
    }
  });
});
