'use strict';

require('jquery-ui-layout');

let BaseDirective = require('scripts/BaseClasses/BaseDirective');

let DataWranglerWranglerDir;
module.exports = DataWranglerWranglerDir = (function() {
  class DataWranglerWranglerDir extends BaseDirective {
    initialize() {
      this.wrangler = this.app_analysis_dataWrangler_wrangler;
      this.msgManager = this.app_analysis_dataWrangler_msgService;
      this.restrict = 'E';
      this.transclude = true;
      this.template = require('partials/analysis/DataWrangler/wrangler.jade')();
      this.replace = true; // replace the directive element with the output of the template

      // The link method does the work of setting the directive
      //  up, things like bindings, jquery calls, etc are done in here
      return this.link = (scope, elem, attr) => {
        var DATA_TYPES;
        // useful to identify which handsontable instance to update
        scope.purpose = attr.purpose;
        DATA_TYPES = this.msgManager.getSupportedDataTypes();
        return this.$timeout(() => { // check if received dataset is flat
          var container, dashboardContainer, myLayout, previewContainer, transformContainer;
          if ((scope.mainArea.dataType != null) && scope.mainArea.dataType === DATA_TYPES.FLAT) {
            myLayout = $('#dt_example').layout({
              north: {
                spacing_open: 0,
                resizable: false,
                slidable: false,
                fxName: 'none'
              },
              south: {
                spacing_open: 0,
                resizable: false,
                slidable: false,
                fxName: 'none'
              },
              west: {
                minSize: 310
              }
            });
            container = $('#table');
            previewContainer = $('#preview');
            transformContainer = $('#transformEditor');
            dashboardContainer = $("#wranglerDashboard");
            this.wrangler.start({
              tableContainer: container,
              transformContainer: transformContainer,
              previewContainer: previewContainer,
              dashboardContainer: dashboardContainer
            });
            // TODO: find correct programmatic way to invoke header propagation
            // assuming there always is a header in data, propagate it in Wrangler
            $('#table .odd .rowHeader').first().mouseup().mousedown();
            d3.select('div.menu_option.Promote')[0][0].__onmousedown();
            return $('div.suggestion.selected').click();
          }
        });
      };
    }

  };

  DataWranglerWranglerDir.inject('app_analysis_dataWrangler_wrangler', 'app_analysis_dataWrangler_msgService', '$timeout');

  return DataWranglerWranglerDir;

}).call(this);

// TODO: consider changing header directly
//          jQuery(container).find('.dataTables_scrollHead tr:nth-child(2) th')
