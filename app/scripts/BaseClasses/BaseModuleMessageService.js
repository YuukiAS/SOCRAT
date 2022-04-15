'use strict';
let indexOf = [].indexOf;

let BaseService = require('scripts/BaseClasses/BaseService.coffee');

/*
  @name BaseModuleMessageService
  @desc Base class for module messaging service
*/
let BaseModuleMessageService = (function() {
  class BaseModuleMessageService extends BaseService {
    initialize() {
      return this.sb = null;
    }

    setSb(sb) {
      return this.sb = sb;
    }

    getMsgList() {
      return this.msgList;
    }

    getSupportedDataTypes() {
      if (this.sb) {
        return this.sb.getSupportedDataTypes();
      } else {
        return false;
      }
    }

    // wrapper function for controller communications
    broadcast(msg, data) {
      return this.$rootScope.$broadcast(msg, data);
    }

    publish(msg, cb, dataFrame = null, deferred = null) {
      if (this.sb && indexOf.call(this.msgList.outgoing, msg) >= 0) {
        if (deferred == null) {
          deferred = this.$q.defer();
        }
        return this.sb.publish({
          msg: msg,
          msgScope: this.msgList.scope,
          callback: function() {
            return cb;
          },
          data: {
            tableName: this.$stateParams.projectId + ':' + this.$stateParams.forkId,
            promise: deferred,
            dataFrame: dataFrame
          }
        });
      } else {
        return false;
      }
    }

    subscribe(msg, listener) {
      var token;
      if (this.sb && indexOf.call(this.msgList.incoming, msg) >= 0) {
        token = this.sb.subscribe({
          msg: msg,
          msgScope: this.msgList.scope,
          listener: listener
        });
        return token;
      } else {
        return false;
      }
    }

    unsubscribe(token) {}

  };

  BaseModuleMessageService.inject('$q', '$rootScope', '$stateParams');

  if (BaseModuleMessageService.sb) {
    BaseModuleMessageService.sb.unsubscribe(token);
  } else {
    false;
  }

  return BaseModuleMessageService;

}).call(this);

module.exports = BaseModuleMessageService
