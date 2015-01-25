// data visualization (*no data manipulation* in codes below)
(function() {

  // retrieved data for visualization
  var data = new Data();
  var studentData = data.getStudentData();
  var avgData = data.getAvgData();
  var structure = new CourseStructure();

  // build up skeleton for rendering
  var selector = d3.select("#progress"),
    svgSide = selector[0][0].offsetWidth,
    r = svgSide * 4 / 9,
    bandWidth = r / 4;

  // init responsive svg
  var rootG = selector.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + svgSide + " " + svgSide)
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", "translate(" + svgSide / 2 + "," + svgSide / 2 + ")");

  // init an equally segmented pie layout
  var pie = d3.layout.pie()
    .value(function(d) {
      return 1;
    });

  // color scale for peer comparison
  var color = d3.scale.linear()
    .domain([-1, 0, 1])
    .range(["#D9321D", "#FFF", "#45D91D"]);

  // init default report group
  var defaultReportG = rootG.append("g")
    .attr("class", "default-report");

  // clickable area and help text for going back
  var backG = rootG.append("g")
    .attr("class", "go-back");
  backG.append("circle")
    .attr("r", r - bandWidth)
    .attr("opacity", 0);
  var helpText = backG.append("text")
    .attr("transform", "translate(0," + (-bandWidth * 2) + ")")
    .attr("opacity", 0)
    .text("<");

  // rendering starts from 'overall' level
  render("overall");

  function render(label) {

    var donut = studentData.donut[label];
    var donutAvg = avgData.donut[label];
    var report = studentData.report[label];
    var reportAvg = avgData.report[label];

    // if donut is array then generate default report, else then clear chart
    if (donut && donut.constructor === Array) {
      // remove old report
      defaultReportG.selectAll("text").remove();
      // default report - title
      defaultReportG.append("text")
        .attr("transform", "translate(0," + (-bandWidth * 1.5) + ")")
        .attr("class", "report-title")
        .text(label.toUpperCase());
      // default report - percentage (for both exercise and video)
      defaultReportG.append("text")
        .attr("class", "percentage-both")
        .text(valToPercentString(report[0]));
      // default report - percentage (for exercise)
      defaultReportG.append("text")
        .attr("transform", "translate(" + (-bandWidth * 2) + ",0)")
        .attr("class", "percentage-exercise")
        .text(valToPercentString(report[1]));
      // default report - percentage (for video)
      defaultReportG.append("text")
        .attr("transform", "translate(" + bandWidth * 2 + ",0)")
        .attr("class", "percentage-video")
        .text(valToPercentString(report[2]));
      // default report - peer comparison
      var diff = report[0] - reportAvg[0];
      defaultReportG.append("text")
        .attr("transform", "translate(0," + bandWidth * 1.5 + ")")
        .text(generateComparisonText(diff))
        .attr("fill", color(diff));
    } else {
      donut = [];
    }

    // init arc groups
    var arcs = rootG.selectAll(".arc")
      .data(pie(donut)); // get angles from pie layout
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

    // foreground arcs for visualize current progress
    var arcFG = d3.svg.arc()
      .innerRadius(function(d) {
        return r - d.data * bandWidth;
      })
      .outerRadius(r);
    arcs.append("path")
      .attr("class", "arc-fg")
      .attr("d", arcFG);

    // colored outer arcs for peer comparison
    var arcComparison = d3.svg.arc()
      .innerRadius(r)
      .outerRadius(r + bandWidth * 0.1);
    arcs.append("path")
      .attr("class", "arc-comparison")
      .attr("opacity", 0)
      .attr("fill", function(d, i) {
        return color(d.data - donutAvg[i]);
      })
      .attr("d", arcComparison);

    // arc report
    arcs.append("text")
      .attr("transform", "translate(0," + (-bandWidth * 1.5) + ")")
      .attr("opacity", 0)
      .attr("class", "report-title")
      .text(function(d, i) {
        return structure.getChildren(label)[i].toUpperCase();
      });
    // arc report - percentage
    arcs.append("text")
      .attr("class", "percentage-both")
      .attr("opacity", 0)
      .text(function(d) {
        return valToPercentString(d.data);
      });
    // arc report - peer comparison
    arcs.append("text")
      .attr("transform", "translate(0," + bandWidth * 1.5 + ")")
      .attr("opacity", 0)
      .attr("fill", function(d, i) {
        return color(d.data - donutAvg[i]);
      })
      .text(function(d, i) {
        return generateComparisonText(d.data - donutAvg[i]);
      });

    // clear old data
    arcs.exit().remove();

    // show corresponding report & highlight hovered arc when hovering an arc *path*
    arcs.selectAll("path")
      .on("mouseover", function() {
        arcHover(this, 0.9, 0, 1);
      })
      .on("mouseout", function() {
        arcHover(this, 1, 1, 0);
      });

    // zoom in when clicking an arc
    arcs.on("click", function(d, i) {
      structure.checkThenRun(structure.getChildren(label)[i])(update);
    });

    // show help text for going back when hovering inner circle and being able to go back
    backG.on("mouseover", function() {
        structure.checkThenRun(structure.getParent(label))(showHelpText);
      })
      .on("mouseout", hideHelpText);

    // zoom out when clicking inner circle
    backG.on("click", function() {
      structure.checkThenRun(structure.getParent(label))(update);
    });

    // TODO transition

  }

  // helpers
  function update(label) {
    render(null); // clean previous data to avoid data collision
    render(label);
    if (label === "overall") {
      hideHelpText();
    }
  }

  function valToPercentString(val) {
    return Math.abs(Math.floor(val * 100)) + "%";
  }

  function generateComparisonText(val) {
    return val >= 0 ? valToPercentString(val) + " ahead of peers" : valToPercentString(val) + " behind peers";
  }

  function arcHover(arcNode, opacityArc, opacityDefaultReport, opacityArcReport) {
    var currentSelector = d3.select(arcNode.parentNode).attr("opacity", opacityArc);
    defaultReportG.attr("opacity", opacityDefaultReport);
    currentSelector.selectAll("text").attr("opacity", opacityArcReport);
    currentSelector.select(".arc-comparison").attr("opacity", opacityArcReport);
  }

  function hideHelpText() {
    return helpText.attr("opacity", 0);
  }

  function showHelpText() {
    return helpText.attr("opacity", 0.2);
  }

})();
