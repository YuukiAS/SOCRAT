'use strict';

let BaseCtrl = require('scripts/BaseClasses/BaseController.coffee');
let GetDataSidebarCtrl;

module.exports = GetDataSidebarCtrl = (function() {
  class GetDataSidebarCtrl extends BaseCtrl {
    initialize() {
      this.eventManager = this.app_analysis_getData_msgService;
      this.selected = null;
      this.DATA_TYPES = this.eventManager.getSupportedDataTypes();
      return this.options = this.app_analysis_getData_showState.getOptions();
    }

    show(val) {
      var matchedOption;
      matchedOption = this.options.filter(function(option) {
        if (option.key === val) {
          return option;
        }
      });
      if ((matchedOption != null) && (matchedOption[0] != null)) {
        this.selected = matchedOption[0].key;
        return this.eventManager.broadcast('getData:updateShowState', matchedOption[0].key);
      }
    }

  };

  GetDataSidebarCtrl.inject('$scope', 'app_analysis_getData_msgService', 'app_analysis_getData_showState');

  return GetDataSidebarCtrl;

}).call(this);
