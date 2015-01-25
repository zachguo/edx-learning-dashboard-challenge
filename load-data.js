// fake data for visualizing arcs and generating report
function Data() {
  var students = {
    0: {
      report: {
        overall: [0.55, 1, 0.4],
        week1: [0.9, 1, 0.8],
        lecture1: [1, 1, 1]
      },
      donut: {
        overall: [0.95, 1, 0.55, 0.9, 0.45, 0, 0],
        week1: [1, 0.9],
        lecture1: [1, 1, 1]
      }
    },
    1: {}
  };

  var avg = {
    report: {
      overall: [0.66, 1, 0.33],
      week1: [1, 1, 1],
      lecture1: [1, 1, 1],
      lecture2: [1, 1, 1]
    },
    donut: {
      overall: [1, 1, 0.8, 0.6, 0.4, 0.2, 0.1],
      week1: [1, 1],
      lecture1: [1, 1, 1],
      lecture2: [1, 1, 1]
    }
  };

  this.getAvgData = function() {
    return avg;
  };

  this.getStudentData = function(id) {
    return id ? students[id] : students[0];
  };

  function getAverage(array) {
    return array.reduce(function(a, b) {
      return a + b;
    }) / array.length;
  }
}

// course structure for
function CourseStructure() {
  var mapping = {
    children: {
      overall: ["week1", "week2", "week3", "week4", "week5", "week6", "week7"],
      week1: ["lecture1", "lecture2"],
      lecture1: ["v1", "v2", "v3"]
    },
    parent: {
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

  this.getParent = function(label) {
    return mapping.parent[label];
  };

  this.getChildren = function(label) {
    return mapping.children[label];
  };

  this.checkThenRun = function(label) {
    // if label is a possible level, then run nextstep function, else then do nothing
    if (label in mapping.children) {
      return function(nextstep) {
        return nextstep(label);
      };
    } else {
      return function(nextstep) {};
    }
  }
}
