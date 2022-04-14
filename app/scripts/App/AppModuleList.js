'use strict';


let Module = require('scripts/BaseClasses/BaseModule.coffee');

/*
 * @name AppModuleList
 * @desc Class for listing of all modules that exist in the app by category
 */
let AppModuleList;
module.exports = AppModuleList = (function () {
  class AppModuleList {
    constructor() {
      this.listAnalysisModules = this.listAnalysisModules.bind(this);
    }

    //#### access methods #####
    getAll() {
      return {
        system: this.system,
        analysis: this.analysis,
        tools: this.tools
      };
    }

    getAnalysisModules() {
      return this.analysis;
    }

    /**
     * Return a list modules defined in this.analysis.
     * @param {Array} moduleList
     * @returns
     */
    listAnalysisModules(moduleList = this.analysis) {
      let i, k, len, m, modules, v;
      modules = [];
      for (i = 0, len = moduleList.length; i < len; i++) {
        m = moduleList[i];
        m = m instanceof Module ? [m.id] : this.listAnalysisModules(((function () {
          let results;
          results = [];
          for (k in m) {
            v = m[k];
            results.push(v);
          }
          return results;
        })())[0]);
        modules = modules.concat(m);
      }
      return modules;
    }

    listAll() {
      console.log(this.system);
      return this.system.concat(this.listAnalysisModules());
    }

  };

  AppModuleList.prototype.system = ['ui.router', 'ui.router.compat', 'ui.bootstrap', 'ngCookies', 'ngResource', 'ngSanitize', 'app_controllers', 'app_directives', 'app_filters', 'app_services', 'app_core', 'app_mediator', 'frapontillo.bootstrap-switch'];

  // include custom modules
  // single module are included as entries into main menu
  // if they have state in their module config file
  // named lists are included as drop-downs into main menu
  AppModuleList.prototype.analysis = [
    require('scripts/Database/Database.module.coffee'),
    require('scripts/analysis/Datalib/Datalib.module.coffee'),
    require('scripts/analysis/GetData/GetData.module.coffee'),
    require('scripts/analysis/DataWrangler/DataWrangler.module.coffee'),
    require('scripts/analysis/Charts/Charts.module.coffee'),
    {

      Tools: [require('scripts/analysis/tools/DimReduction/DimReduction.module.coffee'),
      require('scripts/analysis/tools/DimensionReduction/DimensionReduction.module.coffee'),
      require('scripts/analysis/tools/Cluster/Cluster.module.coffee'),
      require('scripts/analysis/tools/Classification/Classification.module.coffee'),
      require('scripts/analysis/tools/Reliability/Reliability.module.coffee'),
      require('scripts/analysis/tools/Modeler/Modeler.module.coffee'),
      require('scripts/analysis/tools/PowerCalc/PowerCalc.module.coffee'),
      require('scripts/analysis/tools/Stats/Stats.module.coffee')]
    }
  ];

  return AppModuleList;

}).call(this);
