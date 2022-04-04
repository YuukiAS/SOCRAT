'use strict';

let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let  PowerCalcVizDiv;

module.exports = PowerCalcVizDiv = (function() {
  class PowerCalcVizDiv extends BaseDirective {
    initialize() {
      // The link method does the work of setting the directive
      // up, things like bindings, jquery calls, etc are done in here
      return this.link = (scope, elem, attr) => {
        var MARGIN, drawBarGraph, drawNormalCurve;
        MARGIN = {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        };
        scope.$watch('mainArea.chartData', (newChartData) => {
          if (newChartData) {
            return drawNormalCurve(newChartData);
          }
        }, true);
        scope.$watch('mainArea.barChartData', (newChartData) => {
          if (newChartData) {
            return drawBarGraph(newChartData);
          }
        }, true);
        // handleMouseOver = (d, i) ->
        //   svg.select().patg =
        drawBarGraph = function(newChartData) {
          var _graph, barWidth, colorContainer, container, height, j, lab, labX, len, padding, proportion, ref, results, svg, width, x, xAxis, y, yAxis;
          // setting up frame
          proportion = newChartData;
          padding = 50;
          width = 500 - MARGIN.left - MARGIN.right;
          height = 500 - MARGIN.top - MARGIN.bottom;
          container = d3.select(elem[0]);
          container.select('svg').remove();
          svg = container.append('svg').attr('width', width + MARGIN.left + MARGIN.right).attr('height', height + MARGIN.top + MARGIN.bottom);
          _graph = svg.append('g').attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');
          // draw axises
          x = d3.scale.linear().range([padding, width - padding]);
          y = d3.scale.linear().range([height - padding, padding]);
          y.domain([0, 1]);
          xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat("");
          yAxis = d3.svg.axis().scale(y).orient('left');
          //x-axis
          _graph.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + (width - padding) + ')').call(xAxis);
          //y-axis
          _graph.append('g').attr('class', 'y axis').attr('transform', 'translate(' + padding + ',0)').call(yAxis).style('font-size', '16px');
          //adjust width
          _graph.selectAll('.x.axis path').style({
            'fill': 'none',
            'stroke': 'black',
            'shape-rendering': 'crispEdges',
            'stroke-width': '1px'
          });
          _graph.selectAll('.y.axis path').style({
            'fill': 'none',
            'stroke': 'black',
            'shape-rendering': 'crispEdges',
            'stroke-width': '1px'
          });
          // create bar elements
          colorContainer = d3.scale.category10();
          barWidth = 0.15 * (width - padding);
          svg.selectAll("rect").data(proportion).enter().append("rect").attr("x", function(d, i) {
            return 130 + i * 90;
          }).attr("y", function(d) {
            return 430 - 430 * (d * 0.835);
          }).attr("width", barWidth).attr("height", function(d) {
            return 430 * (d * 0.835);
          }).attr('fill', function(d, i) {
            return colorContainer(i);
          }).style('opacity', 0.75);
          labX = 40;
          ref = scope.mainArea.compAgents;
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            lab = ref[j];
            results.push(svg.append("text").attr("class", "label").attr("y", 450).attr("x", labX += 90).text(lab));
          }
          return results;
        };
        return drawNormalCurve = function(newChartData) {
          var bounds, color, d, data, height, i, j, len, lineGen, svg, width, xAxis, xScale, yAxis, yScale;
          bounds = newChartData.bounds;
          data = newChartData.data;
          width = 500;
          height = 500;
          svg = d3.select(elem[0]);
          svg.select('svg').remove();
          svg = svg.append('svg').attr('width', width).attr('height', height + 50);
          svg = svg.append('g').attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');
          // creates a function *Scale which
          // accepts input between a and b (the domain)
          // and maps it to output between c and d (the range).
          xScale = d3.scale.linear().range([0, width]).domain([bounds.left, bounds.right]);
          yScale = d3.scale.linear().range([height, 0]).domain([bounds.bottom, bounds.top]);
          xAxis = d3.svg.axis().ticks(10).scale(xScale);
          yAxis = d3.svg.axis().scale(yScale).ticks(10).tickPadding(0).orient('right');
          lineGen = d3.svg.line().x(function(d) {
            return xScale(d.x);
          }).y(function(d) {
            return yScale(d.y);
          }).interpolate('basis');
          color = d3.scale.category10();
          for (i = j = 0, len = data.length; j < len; i = ++j) {
            d = data[i];
            svg.append('path').attr("class", "line").attr('d', lineGen(d)).attr('id', "path" + i).attr('stroke', 'black').attr('stroke-width', 1).attr('fill', color(i)).style('opacity', 0.7);
          }
          svg.selectAll("#path" + 0).on("mouseover", function() {
            svg.select("#path" + 0).attr("fill", "brown").style("opacity", 1);
            return svg.append("text").attr("id", "Label").attr("class", "label").attr("x", 350).attr("y", 100).text(scope.mainArea.compAgents[0]);
          }).on("mouseout", function() {
            svg.select("#path" + 0).attr("fill", color(0)).style("opacity", 0.7);
            return svg.selectAll("#Label").remove();
          });
          svg.selectAll("#path" + 1).on("mouseover", function() {
            svg.select("#path" + 1).attr("fill", "brown").style("opacity", 1);
            return svg.append("text").attr("id", "Label").attr("class", "label").attr("x", 350).attr("y", 100).text(scope.mainArea.compAgents[1]);
          }).on("mouseout", function() {
            svg.select("#path" + 1).attr("fill", color(1)).style("opacity", 0.7);
            return svg.selectAll("#Label").remove();
          });
          // x-axis
          svg.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
          // y-axis
          svg.append('g').attr('class', 'y axis').attr('transform', 'translate(' + (xScale(bounds.left)) + ',0)').call(yAxis);
          // make x y axis thin
          svg.selectAll('.x.axis path').style({
            'fill': 'none',
            'stroke': 'black',
            'shape-rendering': 'crispEdges',
            'stroke-width': '1px'
          });
          svg.selectAll('.y.axis path').style({
            'fill': 'none',
            'stroke': 'black',
            'shape-rendering': 'crispEdges',
            'stroke-width': '1px'
          });
        };
      };
    }

  };

  PowerCalcVizDiv.inject('$parse');

  return PowerCalcVizDiv;

}).call(this);
