"use strict";
// import module class, it's relative path!
const Module = require("scripts/BaseClasses/BaseModule.coffee");

// export instance of new module
module.exports = new Module({
  // def module id for registration, makes it addressable by SOCRAT
  id: "socrat_analysis_mymodule",
  // module components
  components: {
    // def contains imports of all services, controllers and directives + run block
    services: {
      socrat_analysis_mymodule_initService: require("scripts/analysis/MyModule/MyModuleInit.service.js"),
      socrat_analysis_mymodule_msgService: require("scripts/analysis/MyModule/MyModuleMsgService.service.js"),
      socrat_analysis_mymodule_myService: require("scripts/analysis/MyModule/MyModuleMyService.service.js"), // will alert when loading webpage
    },
    runBlock: require("scripts/analysis/MyModule/MyModuleRunBlock.run.js"),
  },
});
