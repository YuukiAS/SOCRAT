"use strict";

let BaseModuleInitService = require("scripts/BaseClasses/BaseModuleInitService.coffee");

let StatsInitService = function () {
  class StatsInitService extends BaseModuleInitService {
    initialize() {
      this.msgService = this.app_analysis_stats_msgService;
      return this.setMsgList();
    }
  }

  StatsInitService.inject("app_analysis_stats_msgService");

  return StatsInitService;
}.call(this);

module.exports = StatsInitService;
