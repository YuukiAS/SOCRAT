"use strict";

let BaseModuleDataService = require("scripts/BaseClasses/BaseModuleDataService.coffee");
let StatsAlgorithms = function () {
  class StatsAlgorithms extends BaseModuleDataService {
    initialize() {
      this.msgManager = this.app_analysis_stats_msgService;
      this.CIOM = this.app_analysis_stats_CIOM;
      this.CIOP = this.app_analysis_stats_CIOP;
      this.Pilot = this.app_analysis_stats_Pilot;
      return (this.algorithms = [this.CIOM, this.CIOP, this.Pilot]);
    }

    //###########
    getParamsByName(algName) {
      let alg;
      return function () {
        let i, len, ref, results;
        ref = this.algorithms;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alg = ref[i];
          if (algName === alg.getName()) {
            results.push(alg.getParams());
          }
        }
        return results;
      }
        .call(this)
        .shift();
    }

    getChartData(algName) {
      let alg;
      return function () {
        let i, len, ref, results;
        ref = this.algorithms;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alg = ref[i];
          if (algName === alg.getName()) {
            results.push(alg.getChartData());
          }
        }
        return results;
      }
        .call(this)
        .shift();
    }

    setParamsByName(algName, dataIn) {
      let alg;
      return function () {
        let i, len, ref, results;
        ref = this.algorithms;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alg = ref[i];
          if (algName === alg.getName()) {
            results.push(alg.setParams(dataIn));
          }
        }
        return results;
      }
        .call(this)
        .shift();
    }

    passDataByName(algName, dataIn) {
      let alg;
      return function () {
        let i, len, ref, results;
        ref = this.algorithms;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alg = ref[i];
          if (algName === alg.getName()) {
            results.push(alg.saveData(dataIn));
          }
        }
        return results;
      }
        .call(this)
        .shift();
    }

    passAlphaByName(algName, alphaIn) {
      let alg;
      return function () {
        let i, len, ref, results;
        ref = this.algorithms;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alg = ref[i];
          if (algName === alg.getName()) {
            results.push(alg.setAlpha(alphaIn));
          }
        }
        return results;
      }
        .call(this)
        .shift();
    }

    resetByName(algName) {
      let alg;
      return function () {
        let i, len, ref, results;
        ref = this.algorithms;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          alg = ref[i];
          if (algName === alg.getName()) {
            results.push(alg.reset());
          }
        }
        return results;
      }
        .call(this)
        .shift();
    }
  }

  
  StatsAlgorithms.inject(
    "app_analysis_stats_msgService",
    "app_analysis_stats_CIOM",
    "app_analysis_stats_CIOP",
    "app_analysis_stats_Pilot",
    "$interval"
  );

  return StatsAlgorithms;
}.call(this);

module.exports = StatsAlgorithms;
