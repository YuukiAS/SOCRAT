"use strict";

let BaseService = require("scripts/BaseClasses/BaseService.coffee");

/*
  @name: app_analysis_stats_CIOP
  @type: service
  @desc: calculate CI with one proportion (CIOP)
*/
let StatsCIOP = function () {
  class StatsCIOP extends BaseService {
    initialize() {
      this.msgService = this.app_analysis_stats_msgService;
      this.jStat = require("jstat").jStat;
      this.name = "CI for One Proportion";

      this.compAgents = [];
      this.proportion = 0.2;
      this.success = 20;
      this.size = 100;
      this.sizeMax = 200;
      this.zscore = 1.96;
      this.confinterval = [];
      this.upbound = this.confinterval[1];
      this.lowbound = this.confinterval[0];
      this.alpha = 0.05;
      this.standarddev = 0;
      this.update();
      return (this.parameter = {
        p: this.proportion,
        t: this.size,
        n: this.success,
        tMax: this.sizeMax,
        z: this.zscore,
        u: this.upbound,
        l: this.lowbound,
        a: this.alpha,
      });
    }

    saveData(data) {
      this.success = data.popl;
      this.compAgents = data.target;
      this.size = data.total;
      this.update();
    }

    getName() {
      return this.name;
    }

    getParams() {
      this.parameter = {
        p: this.proportion,
        t: this.size,
        n: this.success,
        tMax: this.sizeMax,
        z: this.zscore,
        u: this.upbound,
        l: this.lowbound,
        a: this.alpha,
      };
      return this.parameter;
    }

    setParams(newParams) {
      this.proportion = newParams.p;
      this.success = newParams.n;
      this.size = newParams.t;
      this.update();
    }

    setAlpha(alphaIn) {
      this.alpha = alphaIn;
      this.update();
    }

    update() {
      this.proportion = this.success / this.size;  // * p-hat = r/n
      this.standarddev = Math.sqrt(
        (this.proportion * (1 - this.proportion)) / this.size
      );
      // * Returns a 1-alpha confidence interval for value given the standard deviation sd and the sample size
      this.confinterval = this.jStat.tci(
        this.proportion,
        this.alpha,
        this.standarddev,
        this.size
      );
      this.upbound = this.confinterval[1];
      this.lowbound = this.confinterval[0];
      this.sizeMax = Math.max(this.size, this.sizeMax);
    }
  }

  StatsCIOP.inject("app_analysis_stats_msgService", "$timeout");

  return StatsCIOP;
}.call(this);

module.exports = StatsCIOP;
