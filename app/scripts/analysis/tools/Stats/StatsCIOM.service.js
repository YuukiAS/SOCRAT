'use strict';

let BaseService = require('scripts/BaseClasses/BaseService.coffee');
let StatsCIOM;

/*
	@name: app_analysis_stats_CIOM
	@type: service
	@desc: Performs Confidence Interval for One Mean analysis (CIOM)
*/
module.exports = StatsCIOM = (function() {
  class StatsCIOM extends BaseService {
    initialize() {
      this.jStat = require("jstat").jStat; // we will call studentt.inverse

      this.msgService = this.app_analysis_stats_msgService;
      this.name = 'CI for One Mean';
      this.populations = null;

      // initial value for parameters
      this.CIOMN = 100;
      this.CIOMNMax = 200;
      this.CIOMMean = 0;
      this.CIOMMeanMax = 10;
      this.CIOMletiance = 1; // todo what's this?
      this.CIOMStDev = 1;
      this.CIOMSigmaMax = 20;
      this.CIOMAlpha = 0.01;  // def confidence level
      this.CIOMTScore = 0;
      this.CIOMLowerBound = 0;
      this.CIOMUpperBound = 0;
      this.CIOMMode = "Two Tailed";
      this.CIOMModes = ["Two Tailed", "One Tailed"]; // can be switched

      // data to observe
      this.parameters = {
        n: this.CIOMN,
        nMax: this.CIOMNMax,
        mu: this.CIOMMean,
        meanMax: this.CIOMMeanMax,
        sigma: this.CIOMStDev,
        sigmaMax: this.CIOMSigmaMax,
        t: this.CIOMTScore,
        lowBound: this.CIOMLowerBound,
        upBound: this.CIOMUpperBound,
        mode: this.CIOMMode
      };
      return this.CIOMUpdate();
    }

    saveData(data) {
      this.populations = data.popl;
      return this.CIOMReceiveData();
    }

    setAlpha(alphaIn) {
      this.CIOMAlpha = alphaIn;
      this.CIOMUpdate();
    }

    getName() {
      return this.name;
    }

    /**
     * @returns this.parameters
     */
    getParams() {
      return this.parameters = {
        n: this.CIOMN,
        nMax: this.CIOMNMax,
        mu: Number(this.CIOMMean.toFixed(3)),
        meanMax: Number(this.CIOMMeanMax.toFixed(3)),
        sigma: Number(this.CIOMStDev.toFixed(3)),
        sigmaMax: Number(this.CIOMSigmaMax.toFixed(3)),
        t: Number(this.CIOMTScore.toFixed(3)),
        lowBound: Number(this.CIOMLowerBound.toFixed(3)),
        upBound: Number(this.CIOMUpperBound.toFixed(3)),
        mode: this.CIOMMode
      };
    }

    setParams(newParams) {
      this.CIOMN = Number(newParams.n);
      this.CIOMMean = Number(newParams.mu);
      this.CIOMStDev = Number(newParams.sigma);
      this.CIOMMode = newParams.mode;
      this.CIOMUpdate();
    }

    /**
     * Reset to default values
     */
    reset() {
      this.CIOMN = 100;
      this.CIOMNMax = 200;
      this.CIOMMean = 0;
      this.CIOMMeanMax = 10;
      this.CIOMletiance = 1;
      this.CIOMStDev = 1;
      this.CIOMSigmaMax = 20;
      this.CIOMAlpha = 0.01;
      this.CIOMTScore = 0;
      this.CIOMLowerBound = 0;
      this.CIOMUpperBound = 0;
      this.CIOMMode = "Two Tailed";
      this.CIOMModes = ["Two Tailed", "One Tailed"];
      this.CIOMUpdate();
    }


    CIOMReceiveData() {
      let item = Object.keys(this.populations)[0];
      this.CIOMN = this.populations[item].length;
      this.CIOMMean = this.getMean(this.getSum(this.populations[item]), this.populations[item].length);
      this.CIOMletiance = this.getletiance(this.populations[item], this.CIOMMean);
      this.CIOMStDev = Math.sqrt(this.CIOMletiance);
      this.CIOMUpdate();
    }

    /**
     * Update Nmax, MeanMax, SigmaMax
     */
    CIOMCheckRange() {
      this.CIOMNmax = Math.max(this.CIOMN, this.CIOMNMax);
      this.CIOMMeanMax = Math.max(this.CIOMMean, this.CIOMMeanMax);
      this.CIOMSigmaMax = Math.max(this.CIOMStDev, this.CIOMSigmaMax);
    }

    CIOMUpdate() {
      let df = this.CIOMN - 1;  // degree of freedom
      let alpha; // confidence level
      if (this.CIOMMode === "Two Tailed") {
        alpha = this.CIOMAlpha * 0.5;
      } else {
        alpha = this.CIOMAlpha;
      }
      // Get the value of p in the inverse cdf for the Student's T distribution with df degrees of freedom.
      this.CIOMTScore = Math.abs(this.jStat.studentt.inv(alpha, df));
      // todo check -sigma,+sigma
      this.CIOMLowerBound = this.CIOMMean - this.CIOMStDev * this.CIOMTScore;
      this.CIOMUpperBound = this.CIOMMean + this.CIOMStDev * this.CIOMTScore;
      this.CIOMCheckRange();
    }

    /**
     * @param {Array} values
     * @param {number} mean
     * @returns Sum of squares of (value-mean)
     */
    getletiance(values, mean) {
      let temp = 0;
      let numberOfValues = values.length;
      while (numberOfValues--) {
        temp += Math.pow(parseInt(values[numberOfValues]) - mean, 2);
      }
      return temp / values.length;
    }


    getSum(values) {
      return values.reduce(
        (previousValue, currentValue)=> (parseFloat(previousValue) + parseFloat(currentValue))
      );
    }

    getMean(valueSum, numberOfOccurrences) {
      return valueSum / numberOfOccurrences;
    }

  };

  StatsCIOM.inject('app_analysis_stats_msgService', '$timeout');

  return StatsCIOM;

}).call(this);
