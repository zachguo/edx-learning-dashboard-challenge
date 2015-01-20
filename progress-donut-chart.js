(function() {
  // fake data
  var data = [{
    name: "week1",
    val: 0.95
  }, {
    name: "week2",
    val: 1
  }, {
    name: "week3",
    val: 0.67
  }, {
    name: "week4",
    val: 0.95
  }, {
    name: "week5",
    val: 0.45
  }, {
    name: "week6",
    val: 0
  }, {
    name: "week7",
    val: 0
  }];

  var selector = d3.select("#progress"),
    svgSide = selector[0][0].offsetWidth,
    r = svgSide * 4 / 9,
    bandWidth = r / 4;

  var group = selector.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + svgSide + " " + svgSide)
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", "translate(" + svgSide / 2 + "," + svgSide / 2 + ")");

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return 1; // equally segmented
    });

  var arcs = group.selectAll(".arc")
    .data(pie(data)) // get angles from pie layout
    .enter()
    .append("g")
    .attr("class", "arc");

  // background arcs
  var arcBG = d3.svg.arc()
    .innerRadius(r - bandWidth)
    .outerRadius(r);

  arcs.append("path")
    .attr("class", "arc-bg")
    .attr("d", arcBG);

  // colored foreground arcs for visualize current progress
  var arcFG = d3.svg.arc()
    .innerRadius(r - bandWidth)
    .outerRadius(function(d) {
      return r - (1 - d.data.val) * bandWidth;
    });

  arcs.append("path")
    .attr("class", "arc-fg")
    .attr("d", arcFG);

  arcs.append("text")
    .attr("transform", "translate(0,0)")
    .attr("text-anchor", "middle")
    .attr("opacity", 0)
    .text(function(d) {
      return d.data.name + ": " + d.data.val * 100 + "%";
    });

  // show corresponding text when hovering an arc
  arcs.selectAll("path").on("mouseover", function() {
      var currentSelector = d3.select(this.parentNode).attr("opacity", 0.8);
      currentSelector.select("text").attr("opacity", 1);
    })
    .on("mouseout", function() {
      var currentSelector = d3.select(this.parentNode).attr("opacity", 1);
      currentSelector.select("text").attr("opacity", 0);
    });

})();
