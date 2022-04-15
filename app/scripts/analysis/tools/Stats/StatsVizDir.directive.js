'use strict';

let BaseDirective = require('scripts/BaseClasses/BaseDirective');

let StatsVizDiv = (function() {
  class StatsVizDiv extends BaseDirective {

    initialize() {
      this.restrict = 'E';
      this.template = "<div id='#twoTestGraph' class='graph'></div>";
      return this.replace = true; // replace the directive element with the output of the template
    }

  };

  StatsVizDiv.inject('$parse');  // convert angular expression into javascript function

  return StatsVizDiv;

}).call(this);

module.exports = StatsVizDiv;
