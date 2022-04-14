'use strict';

require('vega-tooltip');

let BaseService = require('scripts/BaseClasses/BaseService.coffee');
let ChartsHistogram;

module.exports = ChartsHistogram = (function() {
  class ChartsHistogram extends BaseService {

    initialize() {
      this.msgService = this.app_analysis_charts_msgService;
      this.dataService = this.app_analysis_charts_dataService;
      this.dataTransform = this.app_analysis_charts_dataTransform;
      this.list = this.app_analysis_charts_list;
      this.sendData = this.app_analysis_charts_sendData;
      this.checkTime = this.app_analysis_charts_checkTime;
      this.DATA_TYPES = this.dataService.getDataTypes();
      this.ve = this.list.getVegaEmbed();
      this.vt = this.list.getVegaTooltip();
      return this.schema = this.list.getVegaLiteSchema();
    }

    plotHist(bins, data, labels, flags) {
      let dic, handler, i, j, len, len1, mean_x, mean_y, opt, sumx, sumy, vlSpec, x_, y_;
      x_ = labels.xLab.value;
      y_ = labels.yLab.value;
      sumx = 0;
      sumy = 0;
      for (i = 0, len = data.length; i < len; i++) {
        dic = data[i];
        sumx += parseFloat(dic[x_]);
        sumy += parseFloat(dic[y_]);
      }
      mean_x = sumx / data.length;
      mean_y = sumy / data.length;
      for (j = 0, len1 = data.length; j < len1; j++) {
        dic = data[j];
        dic["residual_x"] = dic[x_] - mean_x;
        dic["residual_y"] = dic[y_] - mean_y;
      }
      if (flags != null ? flags.x_residual : void 0) {
        labels.xLab.value = "residual_x";
      }
      if (flags != null ? flags.y_residual : void 0) {
        labels.yLab.value = "residual_y";
      }
      vlSpec = {
        "$schema": this.schema,
        "width": 500,
        "height": 500,
        "data": {
          "values": data
        },
        "layer": [
          {
            "mark": "bar",
            "encoding": {
              "x": {
                "bin": {
                  "maxbins": bins
                },
                "field": labels.xLab.value,
                "type": "quantitative",
                "axis": {
                  "title": labels.xLab.value
                }
              }
            }
          },
          {
            "mark": "rule",
            "encoding": {
              "x": {
                "aggregate": "mean",
                "field": labels.xLab.value,
                "type": "quantitative"
              },
              "color": {
                "value": "red"
              },
              "size": {
                "value": 5
              }
            }
          }
        ]
      };
      if (labels.yLab.value === "Count") {
        vlSpec["layer"][0]["encoding"]["y"] = {
          "aggregate": "count",
          "field": labels.xLab.value,
          "type": "quantitative",
          "title": "Count"
        };
      } else {
        vlSpec["layer"][0]["encoding"]["y"] = {
          "field": labels.yLab.value,
          "type": "quantitative",
          "axis": {
            "title": labels.yLab.value
          }
        };
      }
      handler = new this.vt.Handler();
      opt = {
        "actions": {
          export: true,
          source: false,
          editor: false
        },
        "tooltip": handler.call
      };
      return this.ve('#vis', vlSpec, opt, function(error, result) {}).then((result) => {});
    }

    /**
     * Will be called in ChartsDir.directive.js
     * @param {*} data
     * @param {*} labels
     * @param {*} container
     * @param {*} flags
     * @returns
     */
    drawHist(data, labels, container, flags) {
      let $slider, bins;
      //    to find the min and max of a certain key in a list of objects
      //    [
      //      {x: 1, y: 4},
      //      {x: 2, y: 3},
      //      {x: 3, y: 1},
      //      {x: 4, y: 2}
      //    ]
      //    min = Math.min.apply Math, data.map((o) -> o[labels.xLab.value])
      //    max = Math.max.apply Math, data.map((o) -> o[labels.xLab.value])
      bins = 5;
      this.plotHist(bins, data, labels, flags);
      container.select("#slider").remove();
      container.append('div').attr('id', 'slider');
      container.select("#maxbins").remove();
      container.append('div').attr('id', 'maxbins').text('Max bins: 5');
      $slider = $("#slider");
      if ($slider.length > 0) {
        $slider.slider({
          min: 1,
          max: 10,
          value: 5,
          orientation: "horizontal",
          range: "min",
          change: function() {}
        }).addSliderSegments($slider.slider("option").max);
      }
      return $slider.on("slide", (event, ui) => {
        bins = parseInt(ui.value);
        d3.select('div#maxbins').text('Max bins: ' + bins);
        return this.plotHist(bins, data, labels);
      });
    }

  };

  ChartsHistogram.inject('$q', '$stateParams', 'app_analysis_charts_dataTransform', 'app_analysis_charts_list', 'app_analysis_charts_sendData', 'app_analysis_charts_checkTime', 'app_analysis_charts_dataService', 'app_analysis_charts_msgService');

  return ChartsHistogram;

}).call(this);
