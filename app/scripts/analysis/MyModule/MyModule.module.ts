// import module class
let myModule;
import Module from '../../BaseClasses/BaseModule';
// export instance of new module

const initService = require('./MyModuleInit.service');

export default myModule = new Module({
  // def module id for registration, makes it addressable by SOCRAT
  id: 'socrat_analysis_mymodule',
  // module components
  components: { // def contains imports of all services, controllers and directives + run block
    // we will create 3+1 additional files
    services: {

      'socrat_analysis_mymodule_initService': require('scripts/analysis/MyModule/MyModuleInit.service.js'),
      'socrat_analysis_mymodule_msgService': require('scripts/analysis/MyModule/MyModuleMsgService.service.js'),
      'socrat_analysis_mymodule_myService': require('scripts/analysis/MyModule/MyModuleMyService.service.js')
    },
    runBlock: require('scripts/analysis/MyModule/MyModuleRunBlock.run.js')
  }
});
