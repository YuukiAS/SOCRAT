'use strict';

let BaseDirective = require('scripts/BaseClasses/BaseDirective');

let DimReductionVizDir;
module.exports = DimReductionVizDir = (function() {
  class DimReductionVizDir extends BaseDirective {
    initialize() {
      this.restrict = 'E';
      this.template = "<div id='vis' class='graph-container' style='overflow:auto; height: 600px'></div>";
      // @template = "<svg width='100%' height='600'></svg>"
      this.replace = true; // replace the directive element with the output of the template
      this.ve = require('vega-embed').default;
      // The link method does the work of setting the directive
      //  up, things like bindings, jquery calls, etc are done in here
      return this.link = (scope, elem, attr) => {
        var drawDataPoints;
        scope.$watch('mainArea.dataPoints', (newDataPoints) => {
          if (newDataPoints) {
            return drawDataPoints(newDataPoints);
          }
        }, true);
        return drawDataPoints = (dataPoints) => {
          var d, fields, i, j, label, lbl_idx, len, len1, opt, ordinal, ref, row, row_ind, row_obj, vlSpec;
          fields = ['x t-SNE', 'y t-SNE'];
          ordinal = dataPoints.header[2];
          d = [];
          ref = dataPoints.data;
          for (row_ind = i = 0, len = ref.length; i < len; row_ind = ++i) {
            row = ref[row_ind];
            row_obj = {};
            for (lbl_idx = j = 0, len1 = fields.length; j < len1; lbl_idx = ++j) {
              label = fields[lbl_idx];
              row_obj[label] = row[lbl_idx];
            }
            if (dataPoints.labels) {
              row_obj[ordinal] = dataPoints.labels[row_ind];
            }
            d.push(row_obj);
          }
          vlSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "width": 500,
            "height": 500,
            "data": {
              "values": d
            },
            "selection": {
              "grid": {
                "type": "interval",
                "bind": "scales"
              }
            },
            "mark": "circle",
            "encoding": {
              "x": {
                "field": "x t-SNE",
                "type": "quantitative",
                "axis": {
                  "title": 'x t-SNE'
                }
              },
              "y": {
                "field": "y t-SNE",
                "type": "quantitative",
                "axis": {
                  "title": 'y t-SNE'
                }
              }
            }
          };
          if (dataPoints.labels) {
            vlSpec['encoding']['color'] = {
              "field": ordinal,
              "type": "nominal"
            };
          }
          opt = {
            "actions": {
              export: true,
              source: false,
              editor: false
            }
          };
          return this.ve('#vis', vlSpec, opt, function(error, result) {});
        };
      };
    }

  };
  // console.log(BaseDirective)
  // console.log(DimReductionVizDir)
  DimReductionVizDir.inject('$parse');

  return DimReductionVizDir;

}).call(this);

// Callback receiving the View instance and parsed Vega spec
// result.view is the View, which resides under the '#vis' element
