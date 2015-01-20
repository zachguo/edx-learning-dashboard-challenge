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
  // non-responsive chart first
  var selector = d3.select("#progress"),
    svgSide = selector[0][0].offsetWidth,
    r = svgSide * 4 / 9,
    bandWidth = r / 4;

  var svg = selector.append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox', '0 0 ' + svgSide + ' ' + svgSide)
    .attr('preserveAspectRatio', 'xMinYMin');

  var group = svg.append("g")
    .attr("transform", "translate(" + svgSide / 2 + "," + svgSide / 2 + ")");

  var arc = d3.svg.arc()
    .innerRadius(r - bandWidth)
    .outerRadius(r);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return 1;
    }); // equally segmented

  var arcs = group.selectAll(".arc")
    .data(pie(data)) // get angles from pie layout
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc);

  arcs.append("text")
    .attr("transform", "translate(0,0)")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.data.name;
    });
})();
