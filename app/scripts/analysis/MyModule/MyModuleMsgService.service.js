"use strict";
// def Messaging Service

// import base messaging module class
let BaseModuleMessageService = require('scripts/BaseClasses/BaseModuleMessageService.coffee');
let MyModuleMsgService = class MyModuleMsgService extends BaseModuleMessageService {};
// required to define module message list
MyModuleMsgService.prototype.msgList = {
  outgoing: [],
  incoming: [],
  // required to be the same as MyModle.module.js's id
  scope: ['socrat_analysis_mymodule']
};

// export custom messaging service class
module.exports = MyModuleMsgService

