'use strict';

require('jquery-ui/ui/widgets/slider');

let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let ClassificationDir;
module.exports = ClassificationDir = (function() {
  class ClassificationDir extends BaseDirective {
    initialize() {
      this.classification = this.app_analysis_classification_classificationgraph;
      this.restrict = 'E';
      return this.template = "<div id='vis' class='graph-container' style='overflow:auto; height: 600px'></div>";
    }

  };

  ClassificationDir.inject('app_analysis_classification_classificationgraph');

  return ClassificationDir;

}).call(this);
