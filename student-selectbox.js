(function() {
  // use hardcoded student_ids for fast loading
  var student_ids = ['499'];
  // init selectbox for student ID
  d3.select("#select-student")
    .selectAll("option")
    .data(student_ids)
    .enter()
    .append("option")
    .attr("value", function(d) {
      return d;
    })
    .attr("selected", function(d) {
      return d == 499;
    })
    .text(function(d) {
      return "Student-" + d;
    });
})();
