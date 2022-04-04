'use strict';


require('jquery-ui/ui/widgets/slider');

let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let GetDataHistogramDir;
module.exports = GetDataHistogramDir = class GetDataHistogramDir extends BaseDirective {
  initialize() {
    this.restrict = 'E';
    this.template = "<div class='graph-container'></div>";
    return this.link = (scope, elem, attr) => {
      var colName, height, margin, width;
      margin = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      };
      width = 100 - margin.left - margin.right;
      height = 60 - margin.top - margin.bottom;
      colName = attr.colName;
      return scope.$watch('mainArea.colHistograms', (newChartData) => {
        var bar, cardinalityData, container, data, histogram, histogramData, k, svg, tempCount, v, xScale, yScale;
        if (newChartData) {
          data = newChartData[colName];
          container = d3.select(elem.find('div')[0]);
          container.selectAll('*').remove();
          // http://codepen.io/swizec/pen/JRzWwj?editors=1010

          // creating SVG
          svg = container.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
          if (typeof data[0] === 'string') {
            tempCount = {};
            data.forEach(function(d) {
              return tempCount[d] = tempCount[d] != null ? tempCount[d] + 1 : 1;
            });
            cardinalityData = [];
            for (k in tempCount) {
              v = tempCount[k];
              cardinalityData.push({
                name: k,
                count: v
              });
            }
            // Creating scales
            xScale = d3.scale.ordinal().domain(cardinalityData.map(function(d) {
              return d.name;
            })).rangeBands([0, width]);
            yScale = d3.scale.linear().domain(d3.extent(cardinalityData.map(function(d) {
              return d.count;
            }))).range([height, 0]);
            // console.log xScale.rangeBand(),yScale.domain(), yScale.range()
            bar = svg.selectAll('g').data(cardinalityData).enter().append("g").attr("transform", function(d) {
              return "translate(" + xScale(d.name) + ",0)";
            });
            return bar.append('rect').attr('fill', 'steelblue').attr("width", parseInt(xScale.rangeBand() - 5)).attr('height', function(d) {
              return yScale(d.count);
            }).attr('y', function(d) {
              return height - yScale(d.count);
            }).attr('name', function(d) {
              return d.name;
            }).attr('count', function(d) {
              return d.count;
            });
          } else {
            histogram = d3.layout.histogram().bins(10);
            histogramData = histogram(data);
            // Creating scales
            xScale = d3.scale.linear().range([0, width]).domain([
              d3.min(data),
              d3.max(histogramData,
              function(d) {
                return d.x + d.dx;
              })
            ]);
            yScale = d3.scale.linear().range([0, height]).domain([
              0,
              d3.max(histogramData,
              function(d) {
                return d.y;
              })
            ]);
            return svg.selectAll('rect').data(histogramData).enter().append('rect').attr('fill', 'steelblue').attr('width', function(d) {
              // console.log(d.dx,xScale(d.dx),xScale.domain(), xScale.range())
              return xScale(xScale.domain()[0] + d.dx) - 2;
            }).attr('height', function(d) {
              return yScale(d.y);
            }).attr('x', function(d) {
              return xScale(d.x) + 2;
            }).attr('y', function(d) {
              return height - yScale(d.y);
            });
          }
        }
      });
    };
  }

};
