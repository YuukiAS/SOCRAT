'use strict';

let BaseCtrl = require('scripts/BaseClasses/BaseController.coffee');
let DimReductionMainCtrl;

module.exports = DimReductionMainCtrl = (function() {
  class DimReductionMainCtrl extends BaseCtrl {
    initialize() {
      this.dataService = this.app_analysis_dimReduction_dataService;
      this.DATA_TYPES = this.dataService.getDataTypes();
      this.title = '2D t-SNE';
      this.dataType = '';
      this.transforming = false;
      this.transformation = '';
      this.transformations = [];
      this.affinityMatrix = null;
      this.showresults = false;
      this.avgAccuracy = '';
      this.accs = {};
      this.dataPoints = null;
      this.means = null;
      this.assignments = null;
      this.$scope.$on('dimReduction:updateDataPoints', (event, data) => {
        //      @showresults = off if @showresults is on
        // safe enforce $scope.$digest to activate directive watchers
        return this.$timeout(() => {
          return this.updateChartData(data);
        });
      });
      return this.$scope.$on('dimReduction:updateDataType', (event, dataType) => {
        return this.dataType = dataType;
      });
    }

    prettifyArrayOutput(arr) {
      if (arr != null) {
        arr = arr.map(function(x) {
          return x.toFixed(3);
        });
        return '[' + arr.toString().split(',').join('; ') + ']';
      }
    }

    showResults(accuracy) {
      if (Object.keys(accuracy).length !== 0) {
        this.avgAccuracy = accuracy.average.toFixed(2);
        delete accuracy.average;
        this.accs = accuracy;
        return this.showresults = true;
      }
    }

    updateChartData(data) {
      return this.dataPoints = data;
    }

    finish(results = null) {
      this.msgManager.broadcast('dimReduction:done', results);
      return showResults(results);
    }

  };

  DimReductionMainCtrl.inject('app_analysis_dimReduction_dataService', '$timeout', '$scope');

  return DimReductionMainCtrl;

}).call(this);
