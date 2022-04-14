'use strict';
let AppMessageMap, AppRun, Module;

Module = require('scripts/BaseClasses/BaseModule.coffee');

AppMessageMap = require('scripts/App/AppMessageMap.coffee');

/*
 * @name AppRun
 * @desc Class for run block of application module
 */
module.exports = AppRun = (function () {
  class AppRun {
    constructor(modules, runModuleNames) {
      this.modules = modules;
      this.runModuleNames = runModuleNames;
    }

    /**
     * start service in runServices and push into results.
    */
    runModules(core, runServices) {
      let i, idx, len, module, ref, results;
      ref = this.runModuleNames;
      results = [];
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        module = ref[idx];
        if (core.register(module, runServices[idx])) {
          results.push(core.start(module));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    buildMenu() {
      let createItem, i, item, len, module, ref, results;
      createItem = function (module) {
        let el, group, groupName, item, k, ref, v;
        item = null;
        // check if single module or group
        if (module instanceof Module) {
          // check if module has state
          if (((ref = module.state) != null ? ref.name : void 0) && module.state.url) {
            // add module to menu
            item = {
              id: module.id,
              name: module.state.name,
              url: module.state.url,
              type: 'text'
            };
          }
        } else {
          // if collection of modules, recursively create
          [group, groupName] = ((function () {
            let results;
            results = [];
            for (k in module) {
              v = module[k];
              results.push([v, k]);
            }
            return results;
          })())[0];
          item = {
            name: groupName,
            type: 'group',
            items: (function () {
              let i, len, results;
              results = [];
              for (i = 0, len = group.length; i < len; i++) {
                el = group[i];
                results.push(createItem(el));
              }
              return results;
            })()
          };
        }
        return item;
      };
      ref = this.modules;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        module = ref[i];
        item = createItem(module);
        if (item) {
          results.push(this.menu.push(item));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    getRun($rootScope, core, runServices) {
      console.log('APP RUN');
      core.setEventsMapping(new AppMessageMap());
      this.runModules(core, runServices);
      this.buildMenu();
      // subscribe for request from MainCtrl for list of tool modules
      $rootScope.$on('app:get_menu', () => {
        return $rootScope.$broadcast('app:set_menu', this.menu);
      });
      $rootScope.$on("$stateChangeSuccess", function (scope, next, change) {
        console.log('APP: state change: ');
        return console.log(arguments);
      });
      return console.log('run block of app module');
    }

  };

  AppRun.prototype.menu = [];

  return AppRun;

}).call(this);
