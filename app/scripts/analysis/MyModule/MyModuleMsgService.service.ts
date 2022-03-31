let MyModuleMsgService;
import BaseModuleMessageService from 'scripts/BaseClasses/BaseModuleMessageService.coffee';

// export custom messaging service class
export default MyModuleMsgService = (function() {
  MyModuleMsgService = class MyModuleMsgService extends BaseModuleMessageService {
    static initClass() {
      // required to define module message list
      this.prototype.msgList = {
        outgoing: [],
        incoming: [],
        // required to be the same as module id
        scope: ['socrat_analysis_mymodule']
      };
    }
  };
  MyModuleMsgService.initClass();
  return MyModuleMsgService;
})();
