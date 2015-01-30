(function() {

  var selector = d3.select("#leaderboard"),
    width = selector[0][0].offsetWidth,
    height = width / 2,
    barWidth = width / 2,
    barHeight = height / 10;

  // init responsive svg
  var svg = selector.append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin");

  d3.json("_leaderboard.json", function(top10) {

    d3.select("#select-top10")
      .on("change", update);

    var label = d3.select("#select-top10").property("value");

    var scaler = d3.scale.linear()
      .domain([0, top10[label][0].value])
      .range([0, barWidth]);

    var bars = svg.selectAll("g")
      .data(top10[label]);

    bars.enter()
      .append("g")
      .attr("transform", function(d, i) {
        return "translate(" + barWidth + "," + i * barHeight + ")";
      });

    // add bars
    bars.append("rect")
      .attr("width", 0)
      .transition()
      .duration(1000)
      .attr("width", function(d) {
        return scaler(d.value);
      })
      .attr("class", label)
      .attr("height", barHeight - 2);

    // add rank
    bars.append("text")
      .attr("class", "text-ranks")
      .attr("x", -barWidth)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d, i) {
        return "#" + (i + 1);
      });

    // add student names
    bars.append("text")
      .attr("class", "text-student-names")
      .attr("x", -barWidth * 4 / 5)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(getStudentName);

    // add score value
    bars.append("text")
      .attr("class", "text-scores")
      .attr("x", 5)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .attr("fill", "white")
      .text(getScore);

    bars.exit().remove();

    function update() {
      label = this.value;

      var scaler = d3.scale.linear()
        .domain([0, top10[label][0].value])
        .range([0, barWidth]);

      svg.selectAll("rect")
        .data(top10[label])
        .attr("class", label)
        .attr("width", 0)
        .transition()
        .duration(1000)
        .attr("width", function(d) {
          return scaler(d.value);
        });

      svg.selectAll(".text-student-names")
        .data(top10[label])
        .text(getStudentName);

      svg.selectAll(".text-scores")
        .data(top10[label])
        .text(getScore);
    }

    function getStudentName(d) {
      return "student-" + d.id;
    }

    function getScore(d) {
      return d.value;
    }

  });

})();
