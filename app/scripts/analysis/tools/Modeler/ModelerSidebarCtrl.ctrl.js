'use strict';
let indexOf = [].indexOf;

let BaseCtrl = require('scripts/BaseClasses/BaseController.js');
// import BaseCtrl from 'scripts/BaseClasses/BaseController.js'
let ModelerSidebarCtrl;

module.exports = ModelerSidebarCtrl = (function () {
  class ModelerSidebarCtrl extends BaseCtrl {

    // initializeHelper() {
    //   this.introOptions = {

    //   }
    // }

    initialize() {
      // will be injected
      this.dataService = this.app_analysis_modeler_dataService;
      this.msgService = this.app_analysis_modeler_msgService;
      this.distrList = this.app_analysis_modeler_dist_list;
      this.getParams = this.app_analysis_modeler_getParams;

      this.DATA_TYPES = this.dataService.getDataTypes();
      this.distributions = [];
      this.selectedDistributions = null;

      // dataset-specific
      this.dataFrame = null;
      this.dataType = null;
      this.stats = null;
      this.cols = [];
      this.chosenCols = [];
      this.numericalCols = [];
      this.categoricalCols = [];
      this.xCol = null;
      this.labelCol = null;
      // choose first distribution as default one
      this.distributions = this.distrList.getFlat();
      if (this.distributions.length > 0) {
        this.selectedDistributions = this.distributions[0];
        this.updateSidebarControls();
      }
      // getting data
      return this.dataService.getData().then((obj) => {
        if (obj.dataFrame && (obj.dataFrame.dataType != null) && obj.dataFrame.dataType === this.DATA_TYPES.FLAT) {
          if (this.dataType !== obj.dataFrame.dataType) {
            // update local data type
            //console.log("in get list")
            this.dataType = obj.dataFrame.dataType;
            // send update to main are actrl
            this.msgService.broadcast('modeler:updateDataType', obj.dataFrame.dataType);
          }
          // make local copy of data
          this.dataFrame = obj.dataFrame;
          // parse dataFrame
          return this.parseData(obj.dataFrame);
        }
      });
    }

    parseData(data) {
      let df;
      df = data;
      return this.dataService.inferDataTypes(data, (resp) => {
        let i, idx, len, ref, type;
        if ((resp != null) && (resp.dataFrame != null) && (resp.dataFrame.data != null)) {
          ref = df.types;
          for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
            type = ref[idx];
            df.types[idx] = resp.dataFrame.data[idx];
          }
          this.dataFrame = df;
          this.updateSidebarControls(df);
          return this.updateDataPoints(df);
        }
      });
    }

    updateSidebarControls(data = this.dataFrame) {
      let col, idx;
      if (data != null) {
        this.cols = data.header;
        //console.log("selected dist" + @selectedDistributions.name)
        if (this.selectedDistributions.x) {
          this.xCols = (function () {
            let i, len, ref, ref1, results;
            ref = this.cols;
            results = [];
            for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
              col = ref[idx];
              if (ref1 = data.types[idx], indexOf.call(this.selectedDistributions.x, ref1) >= 0) {
                results.push(col);
              }
            }
            return results;
          }).call(this);
          this.xCol = this.xCols[0];
        }
        return this.$timeout(() => {
          return this.updateDataPoints();
        });
      }
    }

    updateDataPoints(data = this.dataFrame) {
      let row, xCol, xType, yCol, yType, zCol, zType;
      [xCol, yCol, zCol] = [this.xCol, this.yCol, this.zCol].map(function (x) {
        return data.header.indexOf(x);
      });
      [xType, yType, zType] = [xCol, yCol, zCol].map(function (x) {
        return data.types[x];
      });
      data = (function () {
        let i, len, ref, results;
        ref = data.data;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          row = ref[i];
          results.push([row[xCol], row[yCol], row[zCol]]);
        }
        return results;
      })();
      return this.msgService.broadcast('modeler:updateDataPoints', {
        dataPoints: data,
        distribution: this.selectedDistributions,
        labels: {
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
          }
        }
      });
    }

  };

  ModelerSidebarCtrl.inject('app_analysis_modeler_dataService',
                            'app_analysis_modeler_msgService',
                            'app_analysis_modeler_dist_list',
                            'app_analysis_modeler_getParams',
                            '$scope',
                            '$timeout'); // window.setTimeout()

  return ModelerSidebarCtrl;

}).call(this);
