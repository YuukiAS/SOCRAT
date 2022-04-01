"use strict";
// def Custom Service

// import base class for data service
let BaseService = require('scripts/BaseClasses/BaseService.coffee');
let MyModuleMyService = class MyModuleMyService extends BaseService { // just a general service
  initialize() {}

  showAlert() { // def alert when loading
    return alert('I pray Thee, O Developer, that I may be beautiful within.');
  }

};
// export custom data service class 
module.exports = MyModuleMyService
