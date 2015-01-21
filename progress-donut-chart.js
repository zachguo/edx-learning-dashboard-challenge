(function() {
  // fake data
  var datasource = {
    all: [{
      name: "week1",
      val: 0.95
    }, {
      name: "week2",
      val: 1
    }, {
      name: "week3",
      val: 0.55
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
    }],
    week1: [{
      parent: "all",
      name: "lecture1",
      val: 1
    }, {
      parent: "all",
      name: "lecture2",
      val: 0.9
    }],
    week2: [{
      parent: "all",
      name: "lecture3",
      val: 1
    }, {
      parent: "all",
      name: "lecture4",
      val: 1
    }],
    week3: [{
      parent: "all",
      name: "lecture5",
      val: 0.4
    }, {
      parent: "all",
      name: "lecture6",
      val: 0.7
    }],
    lecture1: [{
      parent: "week1",
      name: "v1",
      val: 1
    }, {
      parent: "week1",
      name: "v2",
      val: 1
    }, {
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

  function update(data) {
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
      .attr("transform", "translate(0,0)")
      .attr("text-anchor", "middle")
      .attr("opacity", 0)
      .text(function(d) {
        return d.data.name + ": " + d.data.val * 100 + "%";
      });

    arcs.exit().remove();

    arcs.selectAll("path")
      // show corresponding text & highlight hovered arc when hovering an arc
      .on("mouseover", function() {
        var currentSelector = d3.select(this.parentNode).attr("opacity", 0.8);
        currentSelector.select("text").attr("opacity", 1);
      })
      .on("mouseout", function() {
        var currentSelector = d3.select(this.parentNode).attr("opacity", 1);
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

    // TODO default text report when mouseout
    // TODO zoom out (a back-to-parent button in text report?)
    // TODO transition

  }

  update(datasource.all);

})();
