'use strict';

let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let StatsVizDiv;

module.exports = StatsVizDiv = (function() {
  class StatsVizDiv extends BaseDirective {
    initialize() {
      this.restrict = 'E';
      this.template = "<div id='#twoTestGraph' class='graph'></div>";
      return this.replace = true; // replace the directive element with the output of the template
    }

  };

  StatsVizDiv.inject('$parse');

  return StatsVizDiv;

}).call(this);
