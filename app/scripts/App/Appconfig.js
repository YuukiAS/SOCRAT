'use strict';


let Module = require('scripts/BaseClasses/BaseModule.coffee');

let AppRoute = require('scripts/App/AppRoute.js');

let AppRun = require('scripts/App/AppRun.coffee');

/*
 * @name AppConfig
 * @desc Class for config block of application module
 */
let AppConfig;
module.exports = AppConfig = (function() {
  class AppConfig {
    constructor(moduleList) {
      this.moduleList = moduleList;
      // create angular modules
      this.addModuleComponents();
    }

    addModuleComponents(modules = this.moduleList.getAnalysisModules()) {
      var Ctrl, Dir, Service, angModule, ctrlName, dirName, i, k, len, module, moduleComponents, moduleRunBlock, ref, ref1, ref2, results, serviceName, v;
// create modules components
      results = [];
      for (i = 0, len = modules.length; i < len; i++) {
        module = modules[i];
        // check if single module or group
        if (module instanceof Module) {
          // get module
          angModule = angular.module(module.id);
          if (module.components != null) {
            moduleComponents = module.components;
            if (moduleComponents.services) {
              ref = moduleComponents.services;
              // adding services
              for (serviceName in ref) {
                Service = ref[serviceName];
                Service.register(angModule, serviceName);
                console.log('AppConfig: created service ' + serviceName);
                // add init services to app's run block
                if (serviceName.endsWith(this.INIT_SERVICE_SUFFIX)) {
                  this.runModules.push(module.id);
                  this.runServices.push(serviceName);
                }
              }
            }
            if (moduleComponents.controllers) {
              ref1 = moduleComponents.controllers;
              // adding controllers
              for (ctrlName in ref1) {
                Ctrl = ref1[ctrlName];
                Ctrl.register(angModule, ctrlName);
                console.log('AppConfig: created controller ' + ctrlName);
              }
            }
            if (moduleComponents.directives) {
              ref2 = moduleComponents.directives;
              // adding directives
              for (dirName in ref2) {
                Dir = ref2[dirName];
                console.log(Dir)

                Dir.register(angModule, dirName);
                console.log('AppConfig: created directive ' + dirName);
              }
            }
            // create run block of module
            if (moduleComponents.runBlock) {
              moduleRunBlock = new moduleComponents.runBlock(angModule);
              moduleRunBlock.register();
            }
            results.push(console.log('AppConfig: created module ' + module.id));
          } else {
            results.push(void 0);
          }
        } else {
          // if collection of modules, recursively create
          results.push(this.addModuleComponents(((function() {
            var results1;
            results1 = [];
            for (k in module) {
              v = module[k];
              results1.push(v);
            }
            return results1;
          })())[0]));
        }
      }
      return results;
    }

    getConfigBlock() {
      let appRoute, config;
      // create new router
      appRoute = new AppRoute(this.moduleList.getAnalysisModules());
      // workaround for dependency injection
      config = ($locationProvider, $urlRouterProvider, $stateProvider, $qProvider) => {
        return appRoute.getRouter($locationProvider, $urlRouterProvider, $stateProvider, $qProvider);
      };
      // dependencies for AppRoute
      config.$inject = ['$locationProvider', '$urlRouterProvider', '$stateProvider', '$qProvider'];
      return config;
    }

    getRunBlock() {
      var appRun, runBlock;
      // create new run block
      appRun = new AppRun(this.moduleList.getAnalysisModules(), this.runModules);
      // pass the context and module init services
      runBlock = ($rootScope, core, ...modules) => {
        return appRun.getRun($rootScope, core, modules);
      };
      // dependencies for run block
      runBlock.$inject = ['$rootScope', 'app_core_service'].concat(this.runServices);
      return runBlock;
    }

  };

  // suffix to detect initialization service
  AppConfig.prototype.INIT_SERVICE_SUFFIX = '_initService';

  // list of custom modules and their services that need to be initialized
  AppConfig.prototype.runModules = [];

  AppConfig.prototype.runServices = [];

  return AppConfig;

}).call(this);
