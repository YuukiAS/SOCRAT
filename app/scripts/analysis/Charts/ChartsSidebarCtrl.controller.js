'use strict';


let BaseCtrl = require('scripts/BaseClasses/BaseController.coffee');

let ChartsSidebarCtrl, indexOf = [].indexOf;
module.exports = ChartsSidebarCtrl = (function() {
  class ChartsSidebarCtrl extends BaseCtrl {
    initialize() {
      this.msgService = this.app_analysis_charts_msgService;
      this.dataService = this.app_analysis_charts_dataService;
      this.dataTransform = this.app_analysis_charts_dataTransform;
      this.list = this.app_analysis_charts_list;
      this.sendData = this.app_analysis_charts_sendData;
      this.checkTime = this.app_analysis_charts_checkTime;
      this.DATA_TYPES = this.dataService.getDataTypes();
      this.graphs = [];
      this.selectedGraph = null;
      this.maxColors = 10;
      this.dl = require('datalib');
      // chart-specific flags (update dictionary as more flags added)
      // general chart parameters
      this.chartParams = {
        flags: {
          // BarChart:
          horizontal: false,
          stacked: false,
          normalized: false,
          threshold: 0,
          // BinnedHeatmap:
          yBin: null,
          xBin: null,
          marginalHistogram: false,
          // ScatterPlot:
          showSTDEV: false,
          binned: false,
          opacity: false,
          x_residual: false,
          y_residual: false,
          // WordCloud:
          startAngle: 0,
          endAngle: 90,
          orientations: 1,
          text: "Input your text",
          // pie chart
          categorical: false,
          col: null
        },
        data: null,
        labels: null,
        graph: null
      };
      this.$scope.chartParams = {
        flags: {}
      };
      // dataset-specific
      this.dataFrame = null;
      this.dataType = null;
      this.cols = [];
      this.chosenCols = [];
      this.numericalCols = [];
      this.categoricalCols = [];
      this.xCol = null;
      this.yCol = null;
      this.zCol = null;
      this.rCol = null;
      this.originalXCols = null;
      this.originalYCols = null;
      this.originalZCols = null;
      this.originalRCols = null;
      this.labelCol = null;
      this.stream = false;
      this.streamColors = [
        {
          name: "blue",
          scheme: ["#045A8D",
        "#2B8CBE",
        "#74A9CF",
        "#A6BDDB",
        "#D0D1E6",
        "#F1EEF6"]
        },
        {
          name: "pink",
          scheme: ["#980043",
        "#DD1C77",
        "#DF65B0",
        "#C994C7",
        "#D4B9DA",
        "#F1EEF6"]
        },
        {
          name: "orange",
          scheme: ["#B30000",
        "#E34A33",
        "#FC8D59",
        "#FDBB84",
        "#FDD49E",
        "#FEF0D9"]
        }
      ];
      // constants
      this.yearLowerBound = 1900;
      this.yearUpperBound = new Date().getFullYear();
      this.dataService.getData().then((obj) => {
        var dataFrame;
        if (obj.dataFrame && (obj.dataFrame.dataType != null)) {
          dataFrame = obj.dataFrame;
          switch (dataFrame.dataType) {
            case this.DATA_TYPES.FLAT:
              this.graphs = this.list.getFlat();
              this.selectedGraph = this.graphs[0];
              this.dataType = this.DATA_TYPES.FLAT;
              this.parseData(dataFrame);
              if (this.checkTime.checkForTime(dataFrame.data)) {
                return this.graphs = this.list.getTime();
              }
              break;
            case this.DATA_TYPES.NESTED:
              this.graphs = this.list.getNested();
              this.data = dataFrame.data;
              this.dataType = this.DATA_TYPES.NESTED;
              return this.header = {
                key: 0,
                value: "initiate"
              };
          }
        }
      });
      return this.$scope.$watch('sidebar.chartParams.flags', () => {
        return this.updateDataPoints();
      }, true);
    }

    parseData(data) {
      var df;
      df = data;
      return this.dataService.inferDataTypes(data, (resp) => {
        var idx, j, len, ref, type;
        if ((resp != null) && (resp.dataFrame != null) && (resp.dataFrame.data != null)) {
          ref = df.types;
          // update data types with inferred
          for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
            type = ref[idx];
            df.types[idx] = resp.dataFrame.data[idx];
          }
          this.dataFrame = df;
          this.updateSidebarControls(df);
          return this.updateDataPoints(df);
        }
      });
    }

    uniqueVals(arr) {
      return arr.filter(function(x, i, a) {
        return i === a.indexOf(x);
      });
    }

    updateSidebarControls(data = this.dataFrame) {
      var VarForChecking, chartsWithParams, chartsWithR, checkCount, col, colData, colNameCounts, dataValue, dataValue1, dataValue2, dataValue3, forbiddenVarIdx, id, idx, j, k, l, len, len1, len2, len3, len4, len5, len6, m, n, nameIndex, o, p, param, q, r, randomeTestIndex1, randomeTestIndex2, randomeTestIndex3, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, typeIdx, yCol;
      this.cols = data.header;
      this.numericalCols = (function() {
        var j, len, ref, ref1, results;
        ref = this.cols;
        results = [];
        for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
          col = ref[idx];
          if ((ref1 = data.types[idx]) === 'integer' || ref1 === 'number') {
            results.push(col);
          }
        }
        return results;
      }).call(this);
      this.categoricalCols = (function() {
        var j, len, ref, ref1, results;
        ref = this.cols;
        results = [];
        for (idx = j = 0, len = ref.length; j < len; idx = ++j) {
          col = ref[idx];
          if ((ref1 = data.types[idx]) === 'string' || ref1 === 'integer') {
            results.push(col);
          }
        }
        return results;
      }).call(this);
      colData = d3.transpose(data.data);
      this.categoricalCols = this.categoricalCols.filter((x, i) => {
        return this.uniqueVals(colData[this.cols.indexOf(x)]).length < this.maxColors;
      });
      // Determine a list of variables that has more than 20 unique values
      // This list will be excluded from zCols if zLabel is color
      forbiddenVarIdx = [];
      if (((ref = this.selectedGraph) != null ? (ref1 = ref.config) != null ? ref1.vars : void 0 : void 0) != null) {
        if (this.selectedGraph.config.vars.zLabel === "Color") {
          VarForChecking = [];
// VarForChecking only includes the variable idx that has the same
// data type as Color variable, which defined in ChartsList.service.coffee
          for (typeIdx = j = 0, ref2 = data.types.length - 1; j <= ref2; typeIdx = j += 1) {
            if (data.types[typeIdx] === 'string' || data.types[typeIdx] === 'integer') {
              VarForChecking.push(typeIdx);
            }
          }
          VarForChecking.map(function(idx) {
            var colorValueSet, i, k, ref3;
            colorValueSet = new Set();
            for (i = k = 0, ref3 = data.data.length - 1; k <= ref3; i = k += 1) {
              colorValueSet.add(data.data[i][idx]);
            }
            if (colorValueSet.size > 20) {
              return forbiddenVarIdx.push(idx);
            }
          });
        }
        // end if

        // TODO: do this automatically
        chartsWithParams = ['Bar Graph', 'Scatter Plot', 'Binned Heatmap', 'Histogram', 'Tukey Box Plot (1.5 IQR)', 'Normal Distribution', 'Ranged Dot Plot', 'Cumulative Frequency'];
        if (ref3 = this.selectedGraph.name, indexOf.call(chartsWithParams, ref3) >= 0) {
          ref4 = this.selectedGraph.config.params;
          for (k = 0, len = ref4.length; k < len; k++) {
            param = ref4[k];
            this.chartParams.flags[param] = this.selectedGraph.config.params[param];
          }
          ref5 = this.selectedGraph.config.params;
          for (l = 0, len1 = ref5.length; l < len1; l++) {
            id = ref5[l];
            if (this.selectedGraph.config.params[id] !== null) {
              $("#" + id + "Switch").bootstrapSwitch();
            }
          }
        }
        if (this.selectedGraph.config.vars.x) {
          if (this.selectedGraph.config.vars.x.includes("date")) {
            this.xCols = [];
            colNameCounts = data.header.length;
            for (nameIndex = m = 0, ref6 = colNameCounts - 1; (0 <= ref6 ? m <= ref6 : m >= ref6); nameIndex = 0 <= ref6 ? ++m : --m) {
              randomeTestIndex1 = Math.floor(Math.random() * data.data.length);
              dataValue1 = data.data[randomeTestIndex1][nameIndex];
              randomeTestIndex2 = Math.floor(Math.random() * data.data.length);
              dataValue2 = data.data[randomeTestIndex2][nameIndex];
              randomeTestIndex3 = Math.floor(Math.random() * data.data.length);
              dataValue3 = data.data[randomeTestIndex3][nameIndex];
              checkCount = 0;
              ref7 = [dataValue1, dataValue2, dataValue3];
              for (n = 0, len2 = ref7.length; n < len2; n++) {
                dataValue = ref7[n];
                if (parseInt(dataValue) || dataValue === 0) {
                  if ((this.yearLowerBound < dataValue && dataValue < this.yearUpperBound) || (dataValue.length === 8 && (this.yearLowerBound < (ref8 = dataValue.substr(0, 4)) && ref8 < this.yearUpperBound))) {
                    checkCount++;
                  }
                }
              }
              if (checkCount === 3) {
                this.xCols.push(data.header[nameIndex]);
              }
            }
          } else {
            this.xCols = (function() {
              var len3, o, ref10, ref9, results;
              ref9 = this.cols;
              results = [];
              for (idx = o = 0, len3 = ref9.length; o < len3; idx = ++o) {
                col = ref9[idx];
                if (ref10 = data.types[idx], indexOf.call(this.selectedGraph.config.vars.x, ref10) >= 0) {
                  results.push(col);
                }
              }
              return results;
            }).call(this);
          }
          this.xCol = this.xCols[0];
        // trellis chart
        } else if (this.numericalCols.length > 1) {
          this.chosenCols = this.numericalCols.slice(0, 2);
          if (this.categoricalCols.length > 0) {
            this.labelCol = this.categoricalCols[0];
          }
        }
        this.originalXCols = this.xCols;
        if (this.selectedGraph.config.vars.y) {
          this.yCols = [];
          ref9 = this.cols;
          for (idx = o = 0, len3 = ref9.length; o < len3; idx = ++o) {
            col = ref9[idx];
            if (ref10 = data.types[idx], indexOf.call(this.selectedGraph.config.vars.y, ref10) >= 0) {
              this.yCols.push(col);
            }
          }
          if ((ref11 = this.selectedGraph.name) === 'Scatter Plot' || ref11 === 'Histogram') {
            this.yCols.push("Count");
          }
          ref12 = this.yCols;
          // Initialize the y variable
          for (p = 0, len4 = ref12.length; p < len4; p++) {
            yCol = ref12[p];
            if (yCol !== this.xCol) {
              this.yCol = yCol;
              break;
            }
          }
        }
        this.originalYCols = this.yCols;
        if (this.selectedGraph.config.vars.z) {
          this.zCols = [];
          if (this.selectedGraph.name !== 'Treemap' && this.selectedGraph.name !== 'Sunburst') {
            this.zCols.push("None");
          }
          ref13 = this.cols;
          for (idx = q = 0, len5 = ref13.length; q < len5; idx = ++q) {
            col = ref13[idx];
            if (ref14 = data.types[idx], indexOf.call(this.selectedGraph.config.vars.z, ref14) >= 0) {
              // if the variable idx is not in forbiddenVarIdx, put col in zCols list
              if ($.inArray(idx, forbiddenVarIdx) === -1) {
                this.zCols.push(col);
              }
            }
          }
          // Initialize the z variable
          this.zCol = this.zCols[0];
        }
        this.originalZCols = this.zCols;
        chartsWithR = ['Bullet Chart', 'Treemap', 'Sunburst', 'Trellis Chart'];
        if (this.selectedGraph.config.vars.r) {
          this.rCols = [];
          if (ref15 = this.selectedGraph.name, indexOf.call(chartsWithR, ref15) < 0) {
            this.rCols.push("None");
          }
          ref16 = this.cols;
          for (idx = r = 0, len6 = ref16.length; r < len6; idx = ++r) {
            col = ref16[idx];
            if (ref17 = data.types[idx], indexOf.call(this.selectedGraph.config.vars.r, ref17) >= 0) {
              if ($.inArray(idx, forbiddenVarIdx) === -1) {
                this.rCols.push(col);
              }
            }
          }
          // Initialize the z variable
          this.rCol = this.rCols[0];
        }
        this.originalRCols = this.rCols;
      } else {
        console.log('%c CHARTS: chart config is not specified', 'color: red');
      }
      return this.$timeout(() => {
        return this.updateDataPoints();
      });
    }

    updateDataPoints(data = this.dataFrame) {
      var chosenIdxs, col, h, idx, index, j, k, l, labels, len, len1, len2, obj, rCol, rType, ref, ref1, ref2, ref3, removeFromList, row, transformed_data, xCol, xType, yCol, yType, zCol, zType;
      if (this.selectedGraph.config.vars) {
        [xCol, yCol, zCol, rCol] = [this.xCol, this.yCol, this.zCol, this.rCol].map(function(x) {
          return data.header.indexOf(x);
        });
        [xType, yType, zType, rType] = [xCol, yCol, zCol, rCol].map(function(x) {
          return data.types[x];
        });
      }
      transformed_data = [];
      ref = data.data;
      for (j = 0, len = ref.length; j < len; j++) {
        row = ref[j];
        obj = {};
        ref1 = data.header;
        for (index = k = 0, len1 = ref1.length; k < len1; index = ++k) {
          h = ref1[index];
          obj[h] = row[index];
        }
        transformed_data.push(obj);
      }
      if (this.selectedGraph.config.vars.x) {
        // Remove the variables that are already chosen for one field
        // isX is a boolean. This is used to determine if to include 'None' or not
        removeFromList = function(variables, list) {
          var e, l, len2, newList;
          newList = [];
          if (list) {
            for (l = 0, len2 = list.length; l < len2; l++) {
              e = list[l];
              if (e === 'None' || $.inArray(e, variables) === -1) { // e is not in the chosen variables
                newList.push(e);
              }
            }
          }
          return newList;
        };
        this.xCols = removeFromList([this.yCol], this.originalXCols);
        this.yCols = removeFromList([this.xCol], this.originalYCols);
        if (xType === 'string') {
          this.chartParams.flags.categorical = true;
          ref2 = this.cols;
          for (idx = l = 0, len2 = ref2.length; l < len2; idx = ++l) {
            col = ref2[idx];
            if (this.chartParams.flags.col === null && ((ref3 = data.types[idx]) === 'number' || ref3 === 'integer')) {
              this.chartParams.flags.col = col;
              break;
            }
          }
        } else {
          this.chartParams.flags.categorical = false;
        }
        labels = {
          xLab: {
            value: this.xCol,
            type: xType
          },
          yLab: {
            value: this.yCol,
            type: yType
          },
          zLab: {
            value: this.zCol,
            type: zType
          },
          rLab: {
            value: this.rCol,
            type: rType
          }
        };
        data = transformed_data;
      // if scatter plot matrix
      } else if (this.chosenCols.length > 1) {
        if (this.labelCol) {
          labels = (function() {
            var len3, m, ref4, results;
            ref4 = data.data;
            results = [];
            for (m = 0, len3 = ref4.length; m < len3; m++) {
              row = ref4[m];
              results.push(row[data.header.indexOf(this.labelCol)]);
            }
            return results;
          }).call(this);
          labels.splice(0, 0, this.labelCol);
        } else {
          labels = null;
        }
        chosenIdxs = this.chosenCols.map(function(x) {
          return data.header.indexOf(x);
        });
        data = (function() {
          var len3, m, ref4, results;
          ref4 = data.data;
          results = [];
          for (m = 0, len3 = ref4.length; m < len3; m++) {
            row = ref4[m];
            results.push(row.filter(function(el, idx) {
              return indexOf.call(chosenIdxs, idx) >= 0;
            }));
          }
          return results;
        })();
        data.splice(0, 0, this.chosenCols);
      } else {
        data = null;
      }
      this.chartParams.data = data;
      this.chartParams.labels = labels;
      this.chartParams.graph = this.selectedGraph;
      return this.msgService.broadcast('charts:updateGraph', {
        chartParams: this.chartParams
      });
    }

  };

  ChartsSidebarCtrl.inject('$q', '$stateParams', 'app_analysis_charts_dataTransform', 'app_analysis_charts_list', 'app_analysis_charts_sendData', 'app_analysis_charts_checkTime', 'app_analysis_charts_dataService', 'app_analysis_charts_msgService', '$timeout', '$scope');

  return ChartsSidebarCtrl;

}).call(this);
