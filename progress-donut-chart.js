(function() {
  // fake data
  var datasource = {
    all: [{
      parent: "overall",
      name: "week1",
      val: 0.95
    }, {
      parent: "overall",
      name: "week2",
      val: 1
    }, {
      parent: "overall",
      name: "week3",
      val: 0.55
    }, {
      parent: "overall",
      name: "week4",
      val: 0.95
    }, {
      parent: "overall",
      name: "week5",
      val: 0.45
    }, {
      parent: "overall",
      name: "week6",
      val: 0
    }, {
      parent: "overall",
      name: "week7",
      val: 0
    }],
    week1: [{
      parent: "week1",
      name: "lecture1",
      val: 1
    }, {
      parent: "week1",
      name: "lecture2",
      val: 0.9
    }],
    week2: [{
      parent: "week2",
      name: "lecture3",
      val: 1
    }, {
      parent: "week2",
      name: "lecture4",
      val: 1
    }],
    week3: [{
      parent: "week3",
      name: "lecture5",
      val: 0.4
    }, {
      parent: "week3",
      name: "lecture6",
      val: 0.7
    }],
    lecture1: [{
      parent: "lecture1",
      name: "v1",
      val: 1
    }, {
      parent: "lecture1",
      name: "v2",
      val: 1
    }, {
      parent: "lecture1",
      name: "v3",
      val: 1
    }]
  };

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

  var defaultreport = group.append("text")
    .attr("text-anchor", "middle");

  update(datasource.all);

  function update(data) {
    // generate default report
    if (data[0]) {
      defaultreport
      // .attr("opacity", 1)
        .text(generateReport(data[0].parent, 1));
    }

    var arcs = group.selectAll(".arc")
      .data(pie(data)); // get angles from pie layout

    arcs.enter()
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
      .innerRadius(function(d) {
        return r - d.data.val * bandWidth;
      })
      .outerRadius(r);

    arcs.append("path")
      .attr("class", "arc-fg")
      .attr("d", arcFG);

    arcs.append("text")
      .attr("text-anchor", "middle")
      .attr("opacity", 0)
      .text(function(d) {
        return generateReport(d.data.name, d.data.val);
      });

    arcs.exit().remove();

    arcs.selectAll("path")
      // show corresponding text & highlight hovered arc when hovering an arc
      .on("mouseover", function() {
        var currentSelector = d3.select(this.parentNode).attr("opacity", 0.8);
        defaultreport.attr("opacity", 0);
        currentSelector.select("text").attr("opacity", 1);
      })
      .on("mouseout", function() {
        var currentSelector = d3.select(this.parentNode).attr("opacity", 1);
        defaultreport.attr("opacity", 1);
        currentSelector.select("text").attr("opacity", 0);
      })
      // zoom in when clicking an arc
      .on("click", function(d) {
        var child = datasource[d.data.name];
        if (child) {
          update([]);
          update(child);
        } else {
          return;
        }
      });

    // TODO zoom out (a back-to-parent button in text report?)
    // TODO transition

  }

  function generateReport(label, val) {
    return label + ": " + val * 100 + "%";
  }

})();
