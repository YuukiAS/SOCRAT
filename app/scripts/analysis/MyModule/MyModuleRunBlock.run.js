'use strict';
module.exports = class MyModuleRunBlock {
  constructor(module1) {
    this.module = module1;
  }

  register() {
    return this.module.run(this.myModuleRunBlock());
  }

  myModuleRunBlock() { // def call MyService.service.js
    let runBlock = function(socrat_analysis_mymodule_myService) {
      return socrat_analysis_mymodule_myService.showAlert();
    };
    // inject dependencies for run block
    runBlock.$inject = ['socrat_analysis_mymodule_myService'];
    return runBlock;
  }

};
