"use strict";
let BaseService = require("scripts/BaseClasses/BaseService.coffee");

/*
  @name BaseModuleDataService
  @desc Base class for module data retrieval service
  @deps Requires injection of BaseModuleMessageService
*/
let BaseModuleDataService = class BaseModuleDataService extends BaseService {
  initialize() {
    this.getDataRequest = null; // will be overrided in subClass
    return (this.getDataResponse = null);
  }

  getData(outMsg = null, inMsg = null, deferred = null) {
    if (deferred == null) {
      deferred = this.$q.defer();
    }
    // by default use first messages
    if (this.getDataRequest != null && !outMsg) {
      outMsg = this.getDataRequest;
    }
    if (this.getDataResponse != null && !inMsg) {
      inMsg = this.getDataResponse;
    }
    if (outMsg && inMsg) {
      let token = this.msgManager.subscribe(inMsg, function (msg, data) {
        return deferred.resolve(data);
      });
      this.msgManager.publish(outMsg, function () {
        return this.msgManager.unsubscribe(token, null, deferred);
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  post(outMsg, inMsg, data) {
    let deferred, token;
    deferred = this.$q.defer();
    if (outMsg && inMsg) {
      token = this.msgManager.subscribe(inMsg, function (msg, data) {
        return deferred.resolve(data);
      });
      this.msgManager.publish(
        outMsg,
        function () {
          return this.msgManager.unsubscribe(token);
        },
        data,
        deferred
      );
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  saveData(outMsg = null, cb = null, data, deferred = null) {
    if (deferred == null) {
      deferred = this.$q.defer();
    }
    // by default use second messages
    if (this.saveDataMsg != null && !outMsg) {
      outMsg = this.saveDataMsg;
    }
    if (data && outMsg) {
      this.msgManager.publish(
        outMsg,
        function () {
          this.msgManager.unsubscribe(token);
          if (cb != null) {
            cb();
          }
          return deferred.resolve;
        },
        data,
        deferred
      );
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }

  getDataTypes() {
    return this.msgManager.getSupportedDataTypes();
  }
};

module.exports = BaseModuleDataService;
