'use strict';
require('jquery-ui/ui/widgets/slider');

let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let ChartsDir;
module.exports = ChartsDir = (function() {
  class ChartsDir extends BaseDirective {
    initialize() {
      this.areaTrellis = this.app_analysis_charts_areaTrellisChart;
      this.bar = this.app_analysis_charts_barChart;
      this.bubble = this.app_analysis_charts_bubbleChart;
      this.histogram = this.app_analysis_charts_histogram;
      this.pie = this.app_analysis_charts_pieChart;
      this.scatterPlot = this.app_analysis_charts_scatterPlot;
      this.stackBar = this.app_analysis_charts_stackedBar;
      this.time = this.app_analysis_charts_checkTime;
      this.trellis = this.app_analysis_charts_trellisChart;
      this.streamGraph = this.app_analysis_charts_streamChart;
      this.area = this.app_analysis_charts_areaChart;
      this.treemap = this.app_analysis_charts_treemap;
      this.line = this.app_analysis_charts_lineChart;
      this.bivariate = this.app_analysis_charts_bivariateLineChart;
      this.normal = this.app_analysis_charts_normalChart;
      this.tukeyBoxPlot = this.app_analysis_charts_tukeyBoxPlot;
      this.binnedHeatmap = this.app_analysis_charts_binnedHeatmap;
      this.stripPlot = this.app_analysis_charts_stripPlot;
      this.scatterMatrix = this.app_analysis_charts_scatterMatrix;
      this.divergingStackedBar = this.app_analysis_charts_divergingStackedBar;
      this.rangedDotPlot = this.app_analysis_charts_rangedDotPlot;
      this.bulletChart = this.app_analysis_charts_bulletChart;
      this.wordCloud = this.app_analysis_charts_wordCloud;
      this.sunburst = this.app_analysis_charts_sunburst;
      this.cumulativeFrequency = this.app_analysis_charts_cumulative;
      this.residual = this.app_analysis_charts_residual;
      //@charts = [@areaTrellis, @bar, @bubble, @histogram, @pie, @scatterPlot, @stackBar, @time,
      //@trellis, @streamGraph, @area, @treemap, @line, @bivariate, @normal, @tukeyBoxPlot, @binnedHeatmap, @stripPlot]
      this.charts = [this.scatterPlot, this.bar, this.binnedHeatmap, this.bubble, this.histogram, this.pie, this.normal, this.tukeyBoxPlot, this.stripPlot, this.scatterMatrix, this.rangedDotPlot, this.wordCloud];
      this.parallelCoordinates = this.app_analysis_charts_parallelCoordinates;
      this.restrict = 'E';
      this.template = "<div id='vis' class='graph-container' style='overflow:auto; height: 600px'></div>";
      return this.link = (scope, elem) => {
        var container, data, labels;
        data = null;
        labels = null;
        container = null;
        // add segments to a slider
        // https://designmodo.github.io/Flat-UI/docs/components.html#fui-slider
        $.fn.addSliderSegments = function(amount, orientation) {
          return this.each(function() {
            var i, j, output, ref, segment, segmentGap;
            if (orientation === "vertical") {
              output = '';
              for (i = j = 0, ref = amount - 2; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
                output += '<div class="ui-slider-segment" style="top:' + 100 / (amount - 1) * i + '%;"></div>';
              }
              return $(this).prepend(output);
            } else {
              segmentGap = 100 / (amount - 1) + "%";
              segment = '<div class="ui-slider-segment" style="margin-left: ' + segmentGap + ';"></div>';
              return $(this).prepend(segment.repeat(amount - 2));
            }
          });
        };
        return scope.$watch('mainArea.chartData', (newChartData) => {
          var d3charts, flags, scheme;
          if (newChartData && newChartData.chartParams) {
            data = newChartData.chartParams.data;
            labels = newChartData.chartParams.labels;
            scheme = newChartData.chartParams.graph;
            flags = newChartData.chartParams.flags;
          }
          d3charts = d3.select(elem.find('div')[0]).node().parentNode;
          container = d3.select(d3charts);
          switch (scheme.name) {
            // will call function defined in each module
            case 'Trellis Chart':
              return this.trellis.drawTrellis(data, labels, container);
            case 'Area Trellis Chart':
              return this.areaTrellis.areaTrellisChart(data, labels, container);
            case 'Binned Heatmap':
              return this.binnedHeatmap.drawHeatmap(data, labels, container, flags);
            case 'Bar Graph':
              return this.bar.drawBar(data, labels, container, flags);
            case 'Bubble Chart':
              return this.bubble.drawBubble(data, labels, container);
            case 'Histogram':
              return this.histogram.drawHist(data, labels, container, flags);
            case 'Tukey Box Plot (1.5 IQR)':
              return this.tukeyBoxPlot.drawBoxPlot(data, labels, container, flags);
            case 'Scatter Plot':
              return this.scatterPlot.drawScatterPlot(data, labels, container, flags);
            case 'Stacked Bar Chart':
              return this.stackBar.stackedBar(data, labels, container);
            case 'Stream Graph':
              return this.streamGraph.streamGraph(data, labels, container);
            case 'Strip Plot':
              return this.stripPlot.drawStripPlot(data, labels, container);
            case 'Area Chart':
              return this.area.drawArea(data, labels, container);
            case 'Treemap':
              return this.treemap.drawTreemap(data, labels, container);
            case 'Line Chart':
              return this.line.lineChart(data, labels, container);
            case 'Bivariate Area Chart':
              // @time.checkTimeChoice(data)
              return this.bivariate.bivariateChart(height, width, _graph, data, labels);
            case 'Normal Distribution':
              return this.normal.drawNormalCurve(data, labels, container, flags);
            case 'Pie Chart':
              return this.pie.drawPie(data, labels, container, flags);
            case 'Scatter Plot Matrix':
              return this.scatterMatrix.drawScatterMatrix(data, labels, container);
            case 'Diverging Stacked Bar Chart':
              return this.divergingStackedBar.drawDivergingStackedBar(data, labels, container);
            case 'Ranged Dot Plot':
              return this.rangedDotPlot.drawRangedDotPlot(data, labels, container, flags);
            case 'Bullet Chart':
              return this.bulletChart.drawBulletChart(data, labels, container);
            case 'Word Cloud':
              return this.wordCloud.drawWordCloud(data, labels, container, flags);
            case 'Sunburst':
              return this.sunburst.drawSunburst(data, labels, container);
            case 'Cumulative Frequency':
              return this.cumulativeFrequency.drawCumulativeFrequency(data, labels, container, flags);
            case 'Residuals':
              return this.residual.drawResidual(data, labels, container);
            case 'Parallel Coordinates Chart':
              return this.parallelCoordinates.drawParallel(data, width, height, _graph, labels);
          }
        });
      };
    }

  };

  ChartsDir.inject('app_analysis_charts_areaChart', 'app_analysis_charts_areaTrellisChart', 'app_analysis_charts_barChart', 'app_analysis_charts_bivariateLineChart', 'app_analysis_charts_bubbleChart', 'app_analysis_charts_histogram', 'app_analysis_charts_lineChart', 'app_analysis_charts_normalChart', 'app_analysis_charts_pieChart', 'app_analysis_charts_scatterPlot', 'app_analysis_charts_streamChart', 'app_analysis_charts_stackedBar', 'app_analysis_charts_tilfordTree', 'app_analysis_charts_trellisChart', 'app_analysis_charts_treemap', 'app_analysis_charts_tukeyBoxPlot', 'app_analysis_charts_checkTime', 'app_analysis_charts_binnedHeatmap', 'app_analysis_charts_stripPlot', 'app_analysis_charts_scatterMatrix', 'app_analysis_charts_divergingStackedBar', 'app_analysis_charts_rangedDotPlot', 'app_analysis_charts_bulletChart', 'app_analysis_charts_wordCloud', 'app_analysis_charts_sunburst', 'app_analysis_charts_cumulative', 'app_analysis_charts_residual', 'app_analysis_charts_parallelCoordinates');

  return ChartsDir;

}).call(this);
