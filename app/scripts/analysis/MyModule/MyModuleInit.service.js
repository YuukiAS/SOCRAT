"use strict";
// def Init Service: provide a link to the MsgService (id provided in module.js)
let BaseModuleInitService = require("scripts/BaseClasses/BaseModuleInitService.coffee");
let MyModuleInitService = class MyModuleInitService extends BaseModuleInitService {
  // entry point function:
  initialize() {
    this.msgService = this.socrat_analysis_mymodule_msgService;
    // required method call to initiate module messaging interface
    return this.setMsgList();
  }
};
// * requires injection of message service as a dependency, shouldn't be put in constructor
MyModuleInitService.inject("socrat_analysis_mymodule_msgService");

// export custom init service class
module.exports = MyModuleInitService;
