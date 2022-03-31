// def Init Service
let MyModuleInitService;
import BaseModuleInitService from 'scripts/BaseClasses/BaseModuleInitService.coffee';

// export custom init service class
export default MyModuleInitService = (function() {
  MyModuleInitService = class MyModuleInitService extends BaseModuleInitService {
    static initClass() {
      // requires injection of message service as a dependency
      this.inject('socrat_analysis_mymodule_msgService');
    }
    // entry point function:
    initialize() {
      // this renaming is required for initialization!
      this.msgService = this.socrat_analysis_mymodule_msgService;
      // required method call to initiate module messaging interface
      return this.setMsgList();
    }
  };
  MyModuleInitService.initClass();
  return MyModuleInitService;
})();
