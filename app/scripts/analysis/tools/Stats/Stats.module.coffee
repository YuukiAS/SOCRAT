'use strict'

Module = require 'scripts/BaseClasses/BaseModule.coffee'



module.exports = Stats = new Module
  # module id for registration
  id: 'app_analysis_stats'

  # module components
  components:
    services:
      'app_analysis_stats_msgService': require 'scripts/analysis/tools/Stats/StatsMsgService.service.js'
      'app_analysis_stats_algorithms': require 'scripts/analysis/tools/Stats/StatsAlgorithms.service.js'
      'app_analysis_stats_initService': require 'scripts/analysis/tools/Stats/StatsInit.service.js'
      'app_analysis_stats_dataService': require 'scripts/analysis/tools/Stats/StatsDataService.service.js'
      'app_analysis_stats_CIOM': require 'scripts/analysis/tools/Stats/StatsCIOM.service.js'
      'app_analysis_stats_CIOP': require 'scripts/analysis/tools/Stats/StatsCIOP.service.js'
      'app_analysis_stats_Pilot': require 'scripts/analysis/tools/Stats/StatsPilot.service.js'


    controllers:
      'statsMainCtrl': require 'scripts/analysis/tools/Stats/StatsMainCtrl.ctrl.js'
      'statsSidebarCtrl': require 'scripts/analysis/tools/Stats/StatsSidebarCtrl.ctrl.js'

    directives:
      'statsCalcViz': require 'scripts/analysis/tools/Stats/StatsVizDir.directive.js'

  # module state config
  state:
    # module name to show in UI
    name: 'Statistical Analysis'
    url: '/tools/stats'
    mainTemplate: require 'partials/analysis/tools/Stats/main.jade'
    sidebarTemplate: require 'partials/analysis/tools/Stats/sidebar.jade'
