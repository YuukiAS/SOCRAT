"use strict";

let BaseModuleMessageService = require("scripts/BaseClasses/BaseModuleMessageService.coffee");

let StatsMsgService = function () {
  class StatsMsgService extends BaseModuleMessageService {}

  StatsMsgService.prototype.msgList = {
    outgoing: ["getData", "infer data types"],
    incoming: ["takeTable", "data types inferred"],
    // currently scope is same as module id
    scope: ["app_analysis_stats"],
  };

  return StatsMsgService;
}.call(this);

module.exports = StatsMsgService;
