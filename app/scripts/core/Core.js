'use strict';
let Core,
  indexOf = [].indexOf,
  hasProp = {}.hasOwnProperty;

require('scripts/core/EventMngr.coffee');

require('scripts/core/errorMngr.coffee');

require('scripts/core/Sandbox.coffee');

require('scripts/core/utils.coffee');

/*
 * @name Core
 * @desc Class for registering and starting modules
 */
module.exports = Core = (function () {
  class Core {
    constructor(eventMngr, Sandbox, utils1) {
      this.eventMngr = eventMngr;
      this.Sandbox = Sandbox;
      this.utils = utils1;
    }

    checkType(type, val, name) {
      // TODO: change to $exceptionHandler or return false anf throw exception in caller
      if (typeof val !== type && this.utils.typeIsArray(val) !== true) {
        console.log('%cCORE: checkType: ' + `${name} is not a ${type}`, 'color:red');
        throw new TypeError(`${name} has to be a ${type}`);
      }
    }

    static getInstanceOptions(instanceId, module, opt) {
      let io, key, o, ref, val;
      // Merge default options and instance options and start options,
      // without modifying the defaults.
      o = {};
      ref = module.options;
      for (key in ref) {
        val = ref[key];
        // first copy default module options
        o[key] = val;
      }
      // then copy instance options
      io = Core.instanceOpts[instanceId];
      if (io) {
        for (key in io) {
          val = io[key];
          o[key] = val;
        }
      }
      if (opt) {
        for (key in opt) {
          val = opt[key];
          // and finally copy start options
          o[key] = val;
        }
      }
      // return options
      return o;
    }

    // don't save 'this' to access injected components
    static createInstance(moduleId, instanceId = moduleId, opt) {
      let iOpts, instance, module, sb;
      module = this.constructor.modules[moduleId];
      if (this.constructor.instances[instanceId] != null) {
        return this.constructor.instances[instanceId];
      }
      iOpts = this.constructor.getInstanceOptions.apply(this, [instanceId, module, opt]);
      sb = new this.Sandbox(instanceId, iOpts);
      this.utils.installFromTo(this.eventMngr.getInterface(), sb);
      if (module.moduleObj.init(sb)) {
        instance = module.moduleObj;
        instance.options = iOpts;
        instance.id = instanceId;
        this.constructor.instances[instanceId] = instance;
        console.log('%cCORE: created instance of ' + instance.id, 'color:red');
        return instance;
      } else {
        throw new TypeError(`cannot init ${moduleId}: msgService is not defined`);
      }
    }

    /**
     * Add moduleID to Core's modules dictionary
     * @param {string} moduleId e.g. 'app_analysis_charts'
     * @param {*} moduleObj
     * @param {*} opt
     * @returns
     */
    addModule(moduleId, moduleObj, opt) {
      let moduleMsgList;
      this.checkType('string', moduleId, 'module ID');
      this.checkType('object', opt, 'option parameter');
      // check that module instance
      if (moduleObj instanceof this.constructor.BaseModuleInitService) {
        this.checkType('function', moduleObj.init, '"init" of the module');
        this.checkType('function', moduleObj.destroy, '"destroy" of the module');
        this.checkType('function', moduleObj.getMsgList, '"getMsgList" of the module');
        moduleMsgList = moduleObj.getMsgList();
        this.checkType('object', moduleMsgList, 'message list of the module');
        this.checkType('object', moduleMsgList.outgoing, 'outcoming message list of the module');
        // TODO: change to $exceptionHandler
        if (this.constructor.modules[moduleId] != null) {
          throw new TypeError(`module ${moduleId} was already registered`);
        }
        this.constructor.modules[moduleId] = {
          moduleObj: moduleObj,
          options: opt,
          id: moduleId
        };
        console.log('%cCORE: module added: ' + moduleId, 'color:red');
        return true;
      } else {
        throw new TypeError(`module ${moduleId}'s init service is invalid`);
        return false;
      }
    }

    /**
     * Call addModule on methodID and creator
     * @param {string} moduleId
     * @param {*} creator
     * @param {*} opt
     * @returns
     */
    register(moduleId, creator, opt = {}) {
      try {
        return this.addModule.apply(this, [moduleId, creator, opt]);
      } catch (error) {
        let e = error;
        console.log("%cCORE: could not register module " + moduleId, 'color:red');
        console.error(`could not register module ${moduleId}: ${e.message}`);
        return false;
      }
    }

    // unregisters module or plugin
    static unregister(id, type) {
      if (type[id] != null) {
        delete type[id];
        return true;
      }
      return false;
    }

    // unregisters all modules or plugins
    static unregisterAll(type) {
      let id, results;
      results = [];
      for (id in type) {
        results.push(this.unregister(id, type));
      }
      return results;
    }

    static setInstanceOptions(instanceId, opt) {
      let base, k, results, v;
      this.checkType('string', instanceId, 'instance ID');
      this.checkType('object', opt, 'option parameter');
      if ((base = this.instanceOpts)[instanceId] == null) {
        base[instanceId] = {};
      }
      results = [];
      for (k in opt) {
        v = opt[k];
        results.push(this.instanceOpts[instanceId][k] = v);
      }
      return results;
    }

    start(moduleId, opt = {}) {
      let e, instance;
      try {
        this.checkType('string', moduleId, 'module ID');
        this.checkType('object', opt, 'second parameter');
        if (this.constructor.modules[moduleId] == null) {
          throw new Error(`module doesn't exist: ${moduleId}`);
        }
        instance = this.constructor.createInstance.apply(this, [moduleId, opt.instanceId, opt.options]);
        if (instance.running === true) {
          throw new Error('module was already started');
        }
        // subscription for module events
        // TODO: consider checking scope list for containing nothing else but moduleId and "all"
        if ((instance.msgList != null) && (instance.msgList.outgoing != null) && indexOf.call(instance.msgList.scope, moduleId) >= 0) {
          console.log('%cCORE: subscribing for messages from ' + moduleId, 'color:red');
          this.eventMngr.subscribeForEvents({
            msgList: instance.msgList.outgoing,
            scope: [moduleId]
            //          # TODO: figure out context
            //          context: console
          }, this.eventMngr.redirectMsg);
        }
        //      # if the module wants to init in an asynchronous way
        //      if (@utils.getArgumentNames instance.init).length >= 2
        //        # then define a callback
        //        instance.init instance.options, (err) -> opt.callback? err
        //      else
        //        # else call the callback directly after initialisation
        //        instance.init instance.options
        //        opt.callback? null
        instance.running = true;
        console.log('%cCORE: started module ' + moduleId, 'color:red');
        return true;
      } catch (error) {
        e = error;
        console.log(`%cCORE: could not start module: ${e.message}`, 'color:red');
        if (typeof opt.callback === "function") {
          opt.callback(new Error(`could not start module: ${e.message}`));
        }
        return false;
      }
    }

    static startAll(cb, opt) {
      let id, invalid, invalidErr, mods, ref, startAction, valid;
      if (cb instanceof Array) {
        mods = cb;
        cb = opt;
        opt = null;
        valid = (function () {
          let j, len, results;
          results = [];
          for (j = 0, len = mods.length; j < len; j++) {
            id = mods[j];
            if (this.modules[id] != null) {
              results.push(id);
            }
          }
          return results;
        }).call(this);
      } else {
        mods = valid = (function () {
          let results;
          results = [];
          for (id in this.modules) {
            results.push(id);
          }
          return results;
        }).call(this);
      }
      if ((valid.length === (ref = mods.length) && ref === 0)) {
        if (typeof cb === "function") {
          cb(null);
        }
        return true;
      } else if (valid.length !== mods.length) {
        invalid = (function () {
          let j, len, results;
          results = [];
          for (j = 0, len = mods.length; j < len; j++) {
            id = mods[j];
            if (!(indexOf.call(valid, id) >= 0)) {
              results.push(`'${id}'`);
            }
          }
          return results;
        })();
        invalidErr = new Error(`these modules don't exist: ${invalid}`);
      }
      startAction = function (m, next) {
        let k, modOpts, o, v;
        o = {};
        modOpts = this.modules[m].options;
        for (k in modOpts) {
          if (!hasProp.call(modOpts, k)) continue;
          v = modOpts[k];
          if (v) {
            o[k] = v;
          }
        }
        o.callback = function (err) {
          if (typeof modOpts.callback === "function") {
            modOpts.callback(err);
          }
          return next(err);
        };
        return this.start(m, o);
      };
      utils.doForAll(valid, startAction, function (err) {
        let e, i, x;
        if ((err != null ? err.length : void 0) > 0) {
          e = new Error("errors occoured in the following modules: " + `${(function () {
            let j, len, results;
            results = [];
            for (i = j = 0, len = err.length; j < len; i = ++j) {
              x = err[i];
              if (x != null) {
                results.push(`'${valid[i]}'`);
              }
            }
            return results;
          })()}`);
        }
        return typeof cb === "function" ? cb(e || invalidErr) : void 0;
      }, true);
      return invalidErr == null;
    }

    static stop(id, cb) {
      let instance;
      if (instance = this.instances[id]) {
        // if the module wants destroy in an asynchronous way
        if ((utils.getArgumentNames(instance.destroy)).length >= 1) {
          // then define a callback
          instance.destroy(function (err) {
            return typeof cb === "function" ? cb(err) : void 0;
          });
        } else {
          // else call the callback directly after stopping
          instance.destroy();
          if (typeof cb === "function") {
            cb(null);
          }
        }
        // remove
        delete this.instances[id];
        return true;
      } else {
        return false;
      }
    }

    static stopAll(cb) {
      let id;
      return utils.doForAll((function () {
        let results;
        results = [];
        for (id in this.instances) {
          results.push(id);
        }
        return results;
      }).call(this), (() => {
        return this.stop.apply(this, arguments);
      }), cb);
    }

    static ls(o) {
      let id, m, results;
      results = [];
      for (id in o) {
        m = o[id];
        results.push(id);
      }
      return results;
    }

    setEventsMapping(msgMap) {
      this.checkType('object', msgMap, 'event map object');
      this.checkType('function', msgMap.getMap, 'event map getter');
      this.eventMngr.setMsgMap(msgMap.getMap());
      return true;
    }

  };

  Core.modules = {};

  Core.instances = {};

  Core.instanceOpts = {};

  Core.BaseModuleInitService = require('scripts/BaseClasses/BaseModuleInitService.coffee');

  return Core;

}).call(this);

// inject dependencies
Core.$inject = ['eventMngr', 'Sandbox', 'utils'];

// create module and singleton service
angular.module('app_core', ['app_eventMngr', 'app_sandbox', 'app_utils']).service('app_core_service', Core);
