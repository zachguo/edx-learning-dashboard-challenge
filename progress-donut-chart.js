(function() {
  // fake data
  var datasource = {
    overall: [{
      current: "overall",
      name: "week1",
      val: 0.95
    }, {
      current: "overall",
      name: "week2",
      val: 1
    }, {
      current: "overall",
      name: "week3",
      val: 0.55
    }, {
      current: "overall",
      name: "week4",
      val: 0.95
    }, {
      current: "overall",
      name: "week5",
      val: 0.45
    }, {
      current: "overall",
      name: "week6",
      val: 0
    }, {
      current: "overall",
      name: "week7",
      val: 0
    }],
    week1: [{
      current: "week1",
      parent: "overall",
      name: "lecture1",
      val: 1
    }, {
      current: "week1",
      parent: "overall",
      name: "lecture2",
      val: 0.9
    }],
    week2: [{
      current: "week2",
      parent: "overall",
      name: "lecture3",
      val: 1
    }, {
      current: "week2",
      parent: "overall",
      name: "lecture4",
      val: 1
    }],
    week3: [{
      current: "week3",
      parent: "overall",
      name: "lecture5",
      val: 0.4
    }, {
      current: "week3",
      parent: "overall",
      name: "lecture6",
      val: 0.7
    }],
    lecture1: [{
      current: "lecture1",
      parent: "week1",
      name: "v1",
      val: 1
    }, {
      current: "lecture1",
      parent: "week1",
      name: "v2",
      val: 1
    }, {
      current: "lecture1",
      parent: "week1",
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

  var backgroup = group.append("g");

  backgroup.append("circle")
    .attr("r", r - bandWidth * 1.2)
    .attr("opacity", "0");

  var backtext = backgroup.append("text")
    .attr("transform", "translate(0," + (bandWidth * 2 - r) + ")")
    .attr("text-anchor", "middle")
    .attr("opacity", 0)
    .text("click to go back");

  update(datasource.overall);

  function update(data) {
    // generate default report
    if (data[0]) {
      defaultreport
      // .attr("opacity", 1)
        .text(generateReport(data[0].current, 1));
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

    backgroup
      // show help text for going back when hovering inner circle
      .on("mouseover", function() {
        backtext.attr("opacity", "0.3");
      })
      .on("mouseout", function() {
        backtext.attr("opacity", "0");
      })
      // zoom out when clicking inner circle
      .on("click", function() {
        var parent = datasource[data[0].parent];
        if (parent) {
          update([]);
          update(parent);
        } else {
          return;
        }
      });

    // TODO transition

  }

  function generateReport(label, val) {
    return label + ": " + val * 100 + "%";
  }

})();
