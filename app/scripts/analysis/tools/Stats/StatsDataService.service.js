"use strict";

let BaseModuleDataService = require("scripts/BaseClasses/BaseModuleDataService.coffee");

let StatsDataService = function () {
  class StatsDataService extends BaseModuleDataService {
    // requires renaming message service injection to @msgService
    initialize() {
      this.msgManager = this.app_analysis_stats_msgService;
      this.getDataRequest = this.msgManager.getMsgList().outgoing[0];
      return (this.getDataResponse = this.msgManager.getMsgList().incoming[0]);
    }

    inferDataTypes(data, cb) {
      return this.post(
        this.msgManager.getMsgList().outgoing[1],
        this.msgManager.getMsgList().incoming[1],
        data
      ).then((resp) => {
        return cb(resp);
      });
    }
  }

  StatsDataService.inject("$q", "app_analysis_stats_msgService");

  return StatsDataService;
}.call(this);

module.exports = StatsDataService;
