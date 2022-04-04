'use strict';

let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let ClusterVizDir;

module.exports = ClusterVizDir = (function() {
  class ClusterVizDir extends BaseDirective {
    initialize() {
      this.restrict = 'E';
      this.template = "<svg width='100%' height='600'></svg>";
      this.replace = true; // replace the directive element with the output of the template

      // The link method does the work of setting the directive
      //  up, things like bindings, jquery calls, etc are done in here
      return this.link = (scope, elem, attr) => {
        var MARGIN_LEFT, MARGIN_TOP, color, drawDataPoints, graph, meanLayer, redraw, reset, svg, xScale, yScale;
        MARGIN_LEFT = 40;
        MARGIN_TOP = 20;
        graph = null;
        xScale = null;
        yScale = null;
        color = null;
        meanLayer = null;
        svg = d3.select(elem[0]);
        graph = svg.append('g').attr('transform', 'translate(' + MARGIN_LEFT + ',' + MARGIN_TOP + ')');
        meanLayer = graph.append('g');
        color = d3.scale.category10();
        scope.$watch('mainArea.dataPoints', (newDataPoints) => {
          var maxXDataPoint, maxYDataPoint, minXDataPoint, minYDataPoint, row, xDataPoints, yDataPoints;
          if (newDataPoints) {
            xDataPoints = (function() {
              var j, len, results;
              results = [];
              for (j = 0, len = newDataPoints.length; j < len; j++) {
                row = newDataPoints[j];
                results.push(Number(row[0]));
              }
              return results;
            })();
            yDataPoints = (function() {
              var j, len, results;
              results = [];
              for (j = 0, len = newDataPoints.length; j < len; j++) {
                row = newDataPoints[j];
                results.push(Number(row[1]));
              }
              return results;
            })();
            minXDataPoint = d3.min(xDataPoints);
            maxXDataPoint = d3.max(xDataPoints);
            minYDataPoint = d3.min(yDataPoints);
            maxYDataPoint = d3.max(yDataPoints);
            xScale = d3.scale.linear().domain([minXDataPoint, maxXDataPoint]).range([0, 600]);
            yScale = d3.scale.linear().domain([minYDataPoint, maxYDataPoint]).range([0, 500]);
            return drawDataPoints(newDataPoints);
          }
        }, true);
        scope.$watchCollection('mainArea.assignments', (newAssignments) => {
          if (newAssignments) {
            return redraw(scope.mainArea.dataPoints, scope.mainArea.means, newAssignments);
          } else {
            return reset();
          }
        });
        drawDataPoints = function(dataPoints) {
          var pointDots;
          meanLayer.selectAll('.meanDots').remove();
          meanLayer.selectAll('.assignmentLines').remove();
          pointDots = graph.selectAll('.pointDots').data(dataPoints);
          pointDots.enter().append('circle').attr('class', 'pointDots').attr('r', 3).attr('cx', function(d) {
            return xScale(d[0]);
          }).attr('cy', function(d) {
            return yScale(d[1]);
          }).attr('fill', function(d) {
            if (d[2] != null) {
              return color(d[2]);
            } else {
              return 'black';
            }
          });
          pointDots.transition().duration(100).attr('cx', function(d) {
            return xScale(d[0]);
          }).attr('cy', function(d) {
            return yScale(d[1]);
          }).attr('fill', function(d) {
            if (d[2] != null) {
              return color(d[2]);
            } else {
              return 'black';
            }
          });
          return pointDots.exit().remove();
        };
        reset = function() {
          meanLayer.selectAll('.meanDots').remove();
          return meanLayer.selectAll('.assignmentLines').remove();
        };
        return redraw = function(dataPoints, means, assignments) {
          var assignmentLines, meanDots;
          assignmentLines = meanLayer.selectAll('.assignmentLines').data(assignments);
          assignmentLines.enter().append('line').attr('class', 'assignmentLines').attr('x1', function(d, i) {
            return xScale(dataPoints[i][0]);
          }).attr('y1', function(d, i) {
            return yScale(dataPoints[i][1]);
          }).attr('x2', function(d, i) {
            return xScale(means[d][0]);
          }).attr('y2', function(d, i) {
            return yScale(means[d][1]);
          }).attr('stroke', function(d) {
            return color(d);
          });
          assignmentLines.transition().duration(500).attr('x2', function(d, i) {
            return xScale(means[d][0]);
          }).attr('y2', function(d, i) {
            return yScale(means[d][1]);
          }).attr('stroke', function(d) {
            return color(d);
          });
          meanDots = meanLayer.selectAll('.meanDots').data(means);
          meanDots.enter().append('circle').attr('class', 'meanDots').attr('r', 5).attr('stroke', function(d, i) {
            return color(i);
          }).attr('stroke-width', 3).attr('fill', 'white').attr('cx', function(d) {
            return xScale(d[0]);
          }).attr('cy', function(d) {
            return yScale(d[1]);
          });
          meanDots.transition().duration(500).attr('cx', function(d) {
            return xScale(d[0]);
          }).attr('cy', function(d) {
            return yScale(d[1]);
          });
          return meanDots.exit().remove();
        };
      };
    }

  };

  ClusterVizDir.inject('$parse');

  return ClusterVizDir;

}).call(this);
