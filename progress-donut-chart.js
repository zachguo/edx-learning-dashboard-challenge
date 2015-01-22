(function() {
  // fake data
  var studentData = {
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

  var rootG = selector.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + svgSide + " " + svgSide)
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", "translate(" + svgSide / 2 + "," + svgSide / 2 + ")");

  var pie = d3.layout.pie()
    .value(function(d) {
      return 1; // equally segmented
    });

  var defaultReport = rootG.append("text")
    .attr("text-anchor", "middle");

  var backG = rootG.append("g");

  backG.append("circle")
    .attr("r", r - bandWidth * 1.2)
    .attr("opacity", 0);

  var helpText = backG.append("text")
    .attr("transform", "translate(0," + (bandWidth * 2 - r) + ")")
    .attr("text-anchor", "middle")
    .attr("opacity", 0)
    .text("click to go back");

  render(studentData.overall);

  function render(data) {
    // generate default report
    if (data[0]) {
      defaultReport
      // .attr("opacity", 1)
        .text(generateReport(data[0].current, 1));
    }

    var arcs = rootG.selectAll(".arc")
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
        arcHover(this, 0.5, 0, 1);
      })
      .on("mouseout", function() {
        arcHover(this, 1, 1, 0);
      })
      // zoom in when clicking an arc
      .on("click", function(d) {
        checkThenRun(d.data.name)(update);
      });

    backG
      // show help text for going back when hovering inner circle and being able to go back
      .on("mouseover", function() {
        checkThenRun(data[0].parent)(showHelpText);
      })
      .on("mouseout", hideHelpText)
      // zoom out when clicking inner circle
      .on("click", function() {
        checkThenRun(data[0].parent)(update);
      });

    // TODO transition

  }

  function checkThenRun(label) {
    // if label in studentData then run next function else do nothing
    var newData = studentData[label];
    if (newData) {
      return function(nextstep) {
        return nextstep(newData, label);
      };
    } else {
      return function(nextstep) {};
    }
  }

  function update(newData, label) {
    render([]); // clean previous data to avoid data collision
    render(newData);
    if (label === "overall") {
      hideHelpText();
    }
  }

  function generateReport(label, val) {
    return label + ": " + val * 100 + "%";
  }

  function arcHover(arcNode, opacityArc, opacityDefaultReport, opacityArcReport) {
    var currentSelector = d3.select(arcNode.parentNode).attr("opacity", opacityArc);
    defaultReport.attr("opacity", opacityDefaultReport);
    currentSelector.select("text").attr("opacity", opacityArcReport);
  }

  function hideHelpText() {
    return helpText.attr("opacity", 0);
  }

  function showHelpText() {
    return helpText.attr("opacity", 0.5);
  }

})();
