(function() {

  // init table
  var table = d3.select("#leaderboard")
    .append("table")
    .attr("width", "100%")
    .attr("height", "192px"); // fixed height for proper position on small screen

  d3.json("data/leaderboard.json", function(top10) {

    // init selectbox options
    d3.select("#select-top10")
      .selectAll("option")
      .data(["top10_problem", "top10_video", "top10_active", "top10_timespent"])
      .enter()
      .append("option")
      .attr("value", function(d) {
        return d;
      })
      .text(function(d) {
        return labelToTitleText(d);
      });

    render();

    // rerender when window-size or select-option changes
    d3.select(window).on("resize", render);
    d3.select("#leaderboard").on("change", render);
    // rehighlight oneself when student changes
    d3.select("#select-student").on("change.leaderboard", function() {
      table.selectAll("td")
        .call(highlightOneself);
    });

    function render() {
      table.selectAll("*").remove();

      var width = table[0][0].offsetWidth,
        rankWidth = width / 10,
        nameWidth = rankWidth * 4,
        barWidth = rankWidth * 5,
        label = d3.select("#select-top10").property("value");

      var rows = table.selectAll("tr")
        .data(top10[label]);

      rows.enter().append("tr");

      // add ranks
      rows.append("td")
        .attr("class", "text-ranks")
        .attr("width", rankWidth)
        .text(function(d, i) {
          return "#" + (i + 1);
        });

      // add student names
      rows.append("td")
        .attr("class", "text-student-names")
        .attr("width", 0)
        .style("opacity", 0)
        .transition()
        .duration(500)
        .attr("width", nameWidth)
        .style("opacity", 1)
        .text(function(d) {
          return "student-" + d.id;
        });

      // scaler for bars
      var scaler = d3.scale.linear()
        .domain([0, top10[label][0].value])
        .range([0, barWidth]);

      // add bars
      rows.append("td")
        .attr("width", barWidth)
        .attr("class", "text-scores")
        .append("div")
        .style("width", 0)
        .transition()
        .duration(1000)
        .style("width", function(d) {
          return scaler(d.value) + "px";
        })
        .attr("class", labelToClassName(label))
        .text(function(d) {
          return reformatScoreByLabel(d.value, label);
        });

      rows.exit().remove();

      // highlight oneself
      rows.selectAll("td")
        .call(highlightOneself);
    }

  });

  function highlightOneself(selection) {
    selection.classed("lb-oneself", function(d) {
      return d.id == d3.select("#select-student").property("value");
    });
  }

  function reformatScoreByLabel(val, label) {
    switch (label) {
      case "top10_problem":
        return (val * 100).toFixed(1) + "%";
      case "top10_video":
        return (val * 100).toFixed(1) + "%";
      case "top10_active":
        return val + "days";
      case "top10_timespent":
        return Math.round(val / 60) + "h" + (val % 60) + "min";
    }
  }

  function labelToClassName(label) {
    return "lb-" + label.replace("_", "-");
  }

  function labelToTitleText(label) {
    switch (label) {
      case "top10_problem":
        return "10 students completed most problems";
      case "top10_video":
        return "10 students completed most videos";
      case "top10_active":
        return "10 most active students";
      case "top10_timespent":
        return "10 students spent most time";
    }
  }

})();
