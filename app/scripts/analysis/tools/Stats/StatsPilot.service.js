"use strict";
let BaseService = require("scripts/BaseClasses/BaseService.coffee");
let StatsPilot = function () {
  class StatsPilot extends BaseService {
    initialize() {
      this.msgService = this.app_analysis_stats_msgService;
      this.powerCalc = require("powercalc");
      this.name = "Pilot Study";
      this.alpha = 0.05;
      this.success = 20;
      this.pilotRiskExceedMax = 1;
      this.pilotDFMax = 100;
      this.pilotPercentUnderMax = 100;
      this.compAgents = [];
      this.size = 100;
      this.percentUnder = 20;
      this.riskExceed = 0.1;
      this.df = 80;
      this.parameter = {
        p: this.percentUnder,
        r: this.riskExceed,
        d: this.df,
        rMax: this.pilotRiskExceedMax,
        dfMax: this.pilotDFMax,
        pMax: this.pilotPercentUnderMax,
      };
      return this.update("pctUnder");
    }

    //TODO for data driven model
    saveData(data) {
    //   `@success = data.popl
    //    @compAgents= data.target
    //    @size = data.total
    //    @update()`;
    }

    getName() {
      return this.name;
    }

    getParams() {
      this.parameter = {
        p: this.percentUnder,
        r: this.riskExceed,
        d: this.df,
        rMax: this.pilotRiskExceedMax,
        dfMax: this.pilotDFMax,
        pMax: this.pilotPercentUnderMax,
      };
      return this.parameter;
    }

    setParams(newParams) {
      this.percentUnder = newParams.p;
      this.riskExceed = newParams.r;
      this.df = newParams.d;
      this.update(newParams.tar);
    }

    checkRange() {
      this.pilotRiskExceedMax = Math.max(
        this.pilotRiskExceedMax,
        this.parameter.r
      );
      this.pilotDFMax = Math.max(this.pilotDFMax, this.parameter.d);
    }

    setAlpha(alphaIn) {
      this.alpha = alphaIn;
      this.update("pctUnder");
    }

    update(tar) {
      var input, params;
      input = {
        tar: tar,
        pctUnder: this.percentUnder,
        risk: this.riskExceed,
        df: this.df,
      };
      params = this.powerCalc.pilot_handle(input);
      this.percentUnder = params.pctUnder;
      this.riskExceed = params.risk;
      this.df = params.df;
      this.checkRange();
    }
  }

  StatsPilot.inject("app_analysis_stats_msgService", "$timeout");

  return StatsPilot;
}.call(this);
/*
  @name: app_analysis_stats_Pilot
  @type: service
  @desc: pilot study
*/
module.exports = StatsPilot;
