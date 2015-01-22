(function() {
  // fake data
  var courseStructure = {
    children: {
      overall: ["week1", "week2", "week3", "week4", "week5", "week6", "week7"],
      week1: ["lecture1", "lecture2"],
      lecture1: ["v1", "v2", "v3"]
    },
    parents: {
      week1: "overall",
      week2: "overall",
      week3: "overall",
      week4: "overall",
      week5: "overall",
      week6: "overall",
      week7: "overall",
      lecture1: "week1",
      lecture2: "week1",
      v1: "lecture1",
      v2: "lecture1",
      v3: "lecture1"
    }
  };

  var avgProgress = {
    overall: [1, 1, 0.8, 0.6, 0.4, 0.2, 0.1],
    week1: [1, 1],
    lecture1: [1, 1, 1],
    lecture2: [1, 1, 1]
  };

  var studentProgress = {
    overall: [0.95, 1, 0.55, 0.9, 0.45, 0, 0],
    week1: [1, 0.9],
    lecture1: [1, 1, 1]
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

  render("overall");

  function render(label) {

    var data = studentProgress[label];
    var parentLabel = courseStructure.parents[label];

    // if data is array then generate default report, else then clear chart
    if (data && data.constructor === Array) {
      defaultReport.text(generateReport(label, getAverage(studentProgress[label])));
    } else {
      data = [];
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
        return r - d.data * bandWidth;
      })
      .outerRadius(r);

    arcs.append("path")
      .attr("class", "arc-fg")
      .attr("d", arcFG);

    arcs.append("text")
      .attr("text-anchor", "middle")
      .attr("opacity", 0)
      .text(function(d, i) {
        return generateReport(courseStructure.children[label][i], d.data);
      });

    arcs.exit().remove();

    // show corresponding text & highlight hovered arc when hovering an arc *path*
    arcs.selectAll("path")
      .on("mouseover", function() {
        arcHover(this, 0.5, 0, 1);
      })
      .on("mouseout", function() {
        arcHover(this, 1, 1, 0);
      });

    // zoom in when clicking an arc
    arcs.on("click", function(d, i) {
      checkThenRun(courseStructure.children[label][i])(update);
    });

    // show help text for going back when hovering inner circle and being able to go back
    backG.on("mouseover", function() {
        checkThenRun(parentLabel)(showHelpText);
      })
      .on("mouseout", hideHelpText);

    // zoom out when clicking inner circle
    backG.on("click", function() {
      checkThenRun(parentLabel)(update);
    });

    // TODO transition

  }

  function checkThenRun(label) {
    // if label in studentProgress then run next function else do nothing
    if (label in studentProgress) {
      return function(nextstep) {
        return nextstep(label);
      };
    } else {
      return function(nextstep) {};
    }
  }

  function update(label) {
    render(null); // clean previous data to avoid data collision
    render(label);
    if (label === "overall") {
      hideHelpText();
    }
  }

  function getAverage(array) {
    return array.reduce(function(a, b) {
      return a + b;
    }) / array.length;
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
