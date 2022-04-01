"use strict";
/*
  @name:
  @type: directive
  @desc: Directive is loaded into jade file and dynamically renders the graph by waiting for new graph data,
  then creating a histogram from the dataset with the model data on top.

*/
require("jquery-ui/ui/widgets/slider");
let BaseDirective = require("scripts/BaseClasses/BaseDirective");

let ModelerVizDir = class ModelerVizDir extends BaseDirective {
  initialize() {
    this.normal = this.socrat_modeler_distribution_normal;
    this.histogram = this.app_analysis_modeler_hist;
    this.getParams = this.app_analysis_modeler_getParams;
    this.restrict = "E";
    this.template = "<div class='graph-container' style='height: 600px'></div>";
    this.counter = 0;
    this.oldData = {};
    return (this.link = (scope, elem, attr) => {
      var _graph,
        container,
        data,
        height,
        labels,
        margin,
        numerics,
        ranges,
        svg,
        width;
      margin = {
        top: 10,
        right: 40,
        bottom: 50,
        left: 80,
      };
      width = 750 - margin.left - margin.right;
      height = 500 - margin.top - margin.bottom;
      svg = null;
      data = null;
      _graph = null;
      container = null;
      labels = null;
      ranges = null;
      numerics = ["integer", "number"];
      // add segments to a slider
      // https://designmodo.github.io/Flat-UI/docs/components.html#fui-slider
      $.fn.addSliderSegments = function (amount, orientation) {
        return this.each(function () {
          var i, j, output, ref, segment, segmentGap;
          if (orientation === "vertical") {
            output = "";
            for (
              i = j = 0, ref = amount - 2;
              0 <= ref ? j <= ref : j >= ref;
              i = 0 <= ref ? ++j : --j
            ) {
              output +=
                '<div class="ui-slider-segment" style="top:' +
                (100 / (amount - 1)) * i +
                '%;"></div>';
            }
            return $(this).prepend(output);
          } else {
            segmentGap = 100 / (amount - 1) + "%";
            segment =
              '<div class="ui-slider-segment" style="margin-left: ' +
              segmentGap +
              ';"></div>';
            return $(this).prepend(segment.repeat(amount - 2));
          }
        });
      };
      scope.$watch("mainArea.graphData", (newGraphData) => {
        var modelBounds, newChartData, scheme;
        this.counter++;
        if (newGraphData != null && newGraphData !== this.oldData) {
          this.oldData = newGraphData;
          newChartData = newGraphData.chartData;
          if (newChartData != null && newChartData.dataPoints != null) {
            data = newChartData.dataPoints;
            labels = newChartData.labels;
            scheme = newChartData.graph;
            //*************************#
            modelBounds = newChartData.bounds;
            container = d3.select(elem.find("div")[0]);
            container.selectAll("*").remove();
            svg = container
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);
            //svg.select("#remove").remove()
            _graph = svg
              .append("g")
              .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
              );
            data = data.map(function (row) {
              return {
                x: row[0],
                y: row[1],
                z: row[2],
                r: row[3],
              };
            });
            ranges = {
              xMin:
                labels != null && numerics.includes(labels.xLab.type)
                  ? d3.min(data, function (d) {
                      return parseFloat(d.x);
                    })
                  : null,
              yMin:
                labels != null && numerics.includes(labels.yLab.type)
                  ? d3.min(data, function (d) {
                      return parseFloat(d.y);
                    })
                  : null,
              zMin:
                labels != null && numerics.includes(labels.zLab.type)
                  ? d3.min(data, function (d) {
                      return parseFloat(d.z);
                    })
                  : null,
              xMax:
                labels != null && numerics.includes(labels.xLab.type)
                  ? d3.max(data, function (d) {
                      return parseFloat(d.x);
                    })
                  : null,
              yMax:
                labels != null && numerics.includes(labels.yLab.type)
                  ? d3.max(data, function (d) {
                      return parseFloat(d.y);
                    })
                  : null,
              zMax:
                labels != null && numerics.includes(labels.zLab.type)
                  ? d3.max(data, function (d) {
                      return parseFloat(d.z);
                    })
                  : null,
            };
            this.histogram.drawHist(
              _graph,
              data,
              container,
              labels,
              width,
              height,
              ranges,
              modelBounds
            );
            return this.histogram.drawModelCurve(
              newGraphData,
              _graph,
              elem,
              container,
              labels,
              width,
              height,
              ranges,
              modelBounds
            );
          }
        }
      });
      return scope.$watch("mainArea.modelData", (modelData) => {
        var bottomBound,
          curveData,
          leftBound,
          lineGen,
          padding,
          rightBound,
          topBound,
          xAxis,
          xScale,
          yAxis,
          yScale;
        //console.log("Plotting Model Data");
        if (modelData != null && modelData.stats != null) {
          container = d3.select(elem[0]);
          container.selectAll("path").remove();
          leftBound = modelData.stats.stats.leftBound;
          rightBound = modelData.stats.stats.rightBound;
          topBound = modelData.stats.stats.topBound;
          bottomBound = modelData.stats.stats.bottomBound;
          curveData = modelData;
          padding = 50;
          //xScale = d3.scale.linear().range([0, width]).domain([modelData.xMin, modelData.xMax])
          //yScale = d3.scale.linear().range([height-padding, 0]).domain([bottomBound, topBound])

          //************** Change for quantile scaling **************
          xScale = d3.scale
            .linear()
            .range([padding, width - padding])
            .domain([modelData.stats.xMin, modelData.stats.xMax]);
          //changin scale for larger range
          //xScale = d3.scale.linear().range([padding, width - padding ]).domain([modelData.stats.leftBound, modelData.stats.rightBound])
          yScale = d3.scale
            .linear()
            .range([height - padding, padding])
            .domain([bottomBound, topBound]);
          //x.domain([d3.min(data, (d)->parseFloat d.x), d3.max(data, (d)->parseFloat d.x)])
          //y.domain([0, (d3.max dataHist.map (i) -> i.length)])
          xAxis = d3.svg.axis().ticks(20).scale(xScale);
          yAxis = d3.svg
            .axis()
            .scale(yScale)
            .ticks(12)
            .tickPadding(0)
            .orient("right");
          lineGen = d3.svg
            .line()
            .x(function (d) {
              return xScale(d.x);
            })
            .y(function (d) {
              return yScale(d.y);
            })
            .interpolate("basis");
          return _graph
            .append("svg:path")
            .attr("d", lineGen(curveData))
            .data([curveData])
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .on("mousemove", function (d) {
              return showToolTip(
                getZ(
                  xScale.invert(d3.event.x),
                  mean,
                  standardDerivation
                ).toLocaleString(),
                d3.event.x,
                d3.event.y
              );
            })
            .on("mouseout", function (d) {
              return hideToolTip();
            })
            .attr("fill", "none");
        }
      });
    });
  }
};

ModelerVizDir.inject(
  "app_analysis_modeler_hist",
  "app_analysis_modeler_getParams",
  "socrat_modeler_distribution_normal"
);

module.exports = ModelerVizDir;
