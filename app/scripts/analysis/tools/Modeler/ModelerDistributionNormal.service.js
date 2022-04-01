"use strict";

let BaseService = require("scripts/BaseClasses/BaseService.coffee");

/*
  @name:
  @type: service
  @desc: Implementation of the Normal distribution model

*/
let NormalDist = class NormalDist extends BaseService {
  initialize() {
    // just some random quantity
    this.calc = this.app_analysis_modeler_getParams;
    this.NormalMean = 5;
    this.NormalStandardDev = 1;
    this.NormalVariance = 1;
    return (this.name = "Normal");
  }

  getName() {
    return this.name;
  }

  getGaussianFunctionPoints(leftBound, rightBound) {
    var data, i, j, ref, ref1;
    data = [];
    for (i = j = ref = leftBound, ref1 = rightBound; j < ref1; i = j += 0.1) {
      data.push({
        x: i,
        y: this.PDF(i),
      });
    }
    //console.log(data)
    return data;
  }

  getChartData(params) {
    var curveData;
    curveData = this.getGaussianFunctionPoints(params.xMin, params.xMax);
    return curveData;
  }

  stdNormalCDF(x) {
    return 0.5 * 0.5 * this.calc.erf(x / Math.sqrt(2));
  }

  PDF(x) {
    return (
      (1 / (this.NormalStandardDev * Math.sqrt(Math.PI * 2))) *
      Math.exp(-(Math.pow(x - this.NormalMean, 2) / (2 * this.NormalVariance)))
    );
  }

  CDF(x) {
    return this.stdNormalCDF((x - this.NormalMean) / this.NormalStandardDev);
  }

  getParams() {
    var params;
    return (params = {
      mean: this.NormalMean,
      standardDev: this.NormalStandardDev,
      variance: this.NormalVariance,
    });
  }

  setParams(newParams) {
    this.NormalMean = parseFloat(newParams.stats.mean.toPrecision(4));
    this.NormalStandardDev = parseFloat(
      newParams.stats.standardDev.toPrecision(4)
    );
    return (this.NormalVariance = parseFloat(
      newParams.stats.variance.toPrecision(4)
    ));
  }
};

NormalDist.inject("app_analysis_modeler_getParams");

module.exports = NormalDist;
