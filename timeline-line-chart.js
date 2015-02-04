(function() {

  d3.json("data/_timeline.json", function(activities) {

    render();

    d3.select(window).on("resize.timeline", render);
    d3.select("#select-student").on("change.timeline", render);

    function render() {

      var selector = d3.select("#timeline"),
        width = selector[0][0].offsetWidth,
        height = d3.select(window)[0][0].outerWidth >= 1000 ? d3.select("#progress")[0][0].offsetHeight - 350 : width / 2,
        sid = d3.select("#select-student").property("value");

      selector.selectAll("svg").remove();

      // init responsive svg
      var svg = selector.append("svg")
        .attr("width", width)
        .attr("height", height);

      var activity = activities[sid],
        numDays = activity.length,
        rectSide = width / numDays,
        lineChartHeight = height - rectSide,
        duration = 1000,
        perdayThreshold = 20;

      var y = d3.scale.linear()
        .range([lineChartHeight, 0]);
      y = y.domain([0, getTimelineTypeSuffix() === "" ? 100 : perdayThreshold]);

      var days = svg.selectAll('.tl-day')
        .data(activity)
        .enter()
        .append("g")
        .attr("class", "tl-day");

      // days punch card
      days.append("rect")
        .attr("width", rectSide)
        .attr("height", rectSide)
        .attr("x", function(d, i) {
          return i * rectSide;
        })
        .attr("y", lineChartHeight)
        .attr("class", function(d) {
          return d.active == 1 ? "tl-active" : "tl-inactive";
        });

      // days guide column
      days.append("rect")
        .attr("width", rectSide)
        .attr("height", lineChartHeight)
        .attr("x", function(d, i) {
          return i * rectSide;
        }).attr("class", function(d) {
          return d.active == 1 ? "tl-active tl-guide" : "tl-inactive tl-guide";
        })
        .attr("opacity", 0);

      // hover effect for days
      days.selectAll("rect")
        .on("mouseover", function() {
          changeSiblingGuideOpacity(this, 0.5);
        })
        .on("mouseout", function() {
          changeSiblingGuideOpacity(this, 0);
        })
        .call(tooltip);

      // add lines
      (["video", "problem"]).forEach(function(label) {
        svg.call(createLine, label);
      });
      // add horizontal lines
      var hlineG = svg.selectAll(".reference")
        .data([perdayThreshold/2, perdayThreshold, 50, 100, 60])
        .enter()
        .append("g")
        .attr("class", "reference");
      hlineG.append("line")
        .attr("x1", 0.5 * rectSide)
        .attr("y1", function(d) {
          return y(d);
        })
        .attr("x2", (numDays - 0.5) * rectSide)
        .attr("y2", function(d) {
          return y(d);
        })
        .attr("class", function(d) {
          return getHlineType(d) + "-line";
        })
        .classed("perday", function(d) {
          return d <= perdayThreshold;
        });
      hlineG.append("text")
        .attr("x", 0.5 * rectSide)
        .attr("y", function(d) {
          return y(d);
        })
        .attr("class", function(d) {
          return getHlineType(d) + "-text";
        })
        .classed("perday", function(d) {
          return d <= perdayThreshold;
        })
        .text(function(d) {
          return d % 60 !== 0 ? d + "%" : d + "% Certification";
        });
      hlineG.call(togglePerDayReference);

      // curtain animation
      svg.append('rect')
        .attr('x', -1 * width)
        .attr('y', -1 * height)
        .attr('height', height)
        .attr('width', width)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .transition()
        .duration(duration)
        .attr("width", 0);

      // transition between accumulated and perday data
      d3.select("#select-timelinetype")
        .on("change", update);

      function update() {
        // update y scale
        y = y.domain([0, getTimelineTypeSuffix() === "" ? 100 : perdayThreshold]);
        // update reference lines height
        hlineG.selectAll("text")
          .transition()
          .attr("y", function(d) {
            return y(d);
          });
        hlineG.selectAll("line")
          .transition()
          .attr("y1", function(d) {
            return y(d);
          })
          .attr("y2", function(d) {
            return y(d);
          });
        hlineG.call(togglePerDayReference);
        // update timelines
        (["video", "problem"]).forEach(function(label) {
          var lineGen = line(label + getTimelineTypeSuffix());
          d3.selectAll("path." + label + "-line")
            .transition()
            .attr("d", lineGen(activity));
        });
      }

      function changeSiblingGuideOpacity(node, val) {
        d3.select(node.parentNode)
          .select(".tl-guide")
          .attr("opacity", val);
      }

      function line(label) {
        return d3.svg.line()
          .x(function(d, i) {
            return (i + 0.5) * rectSide;
          })
          .y(function(d) {
            return y(d[label]);
          })
          .interpolate('step-after');
      }

      function createLine(selection, label) {
        var lineGen = line(label + getTimelineTypeSuffix());
        selection.append("path")
          .attr("d", lineGen(activity))
          .attr("class", label + "-line");
      }

      function getTimelineTypeSuffix() {
        return d3.select("#select-timelinetype").property("value") === "accumulated" ? "" : "PerDay";
      }

      function getHlineType(val) {
        return val % 60 === 0 ? "certificate" : "reference";
      }

      function togglePerDayReference(selection) {
        selection.selectAll(".perday")
          .attr("display", function(d) {
            return getTimelineTypeSuffix() === "" ? "none" : "auto";
          });
      }

      function tooltip(selection) {

        var rootSelection = d3.select('body'),
          tooltipDiv;

        selection.on('mouseover.tooltip', function(d, i) {
            rootSelection.selectAll('div.tooltip').remove(); // clean up lost tooltips
            var labelSuffix = getTimelineTypeSuffix();
            tooltipDiv = rootSelection.append('div')
              .attr('class', 'tooltip');
            positionTooltip();
            var whetherActive = d.active === 1 ? "active" : "inactive";
            tooltipDiv.html(
              p(d.date) +
              p(whetherActive.toUpperCase(), whetherActive) +
              p("P: " + d["problem" + labelSuffix].toFixed(1) + "%", "problem") +
              p("V: " + d["video" + labelSuffix].toFixed(1) + "%", "video")
            );
          })
          .on('mousemove.tooltip', function() {
            positionTooltip();
          })
          .on('mouseout.tooltip', function() {
            tooltipDiv.remove();
          });

        function positionTooltip() {
          var mousePosition = d3.mouse(rootSelection.node());
          tooltipDiv.style({
            left: (mousePosition[0] + 10) + 'px',
            top: (mousePosition[1] - 40) + 'px',
          });
        }

        function p(d, c) {
          return c ? "<p class=\"tooltip-" + c + "\">" + d + "</p>" : "<p>" + d + "</p>";
        }

      }

    }

  });

})();
