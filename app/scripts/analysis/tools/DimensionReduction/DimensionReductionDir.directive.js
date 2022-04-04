'use strict';
let BaseDirective = require('scripts/BaseClasses/BaseDirective');
let DimensionReductionDir;

module.exports = DimensionReductionDir = (function() {
  class DimensionReductionDir extends BaseDirective {
    initialize() {
      this.restrict = 'E';
      this.template = "<div></div>"; // can change to <p> or <div>
      this.replace = true; // replace the directive element with the output of the template

      // The link method does the work of setting the directive
      //  up, things like bindings, jquery calls, etc are done in here
      return this.link = (scope, elem, attr) => {
        var MARGIN_LEFT, MARGIN_TOP, color, graph, meanLayer, xScale, yScale;
        MARGIN_LEFT = 40;
        MARGIN_TOP = 20;
        graph = null;
        xScale = null;
        yScale = null;
        color = null;
        meanLayer = null;
        return scope.$watch('mainArea.receivedLink', (receivedLink) => {
          var newTensorBoard, tensorboard, tryNode;
          tensorboard = document.getElementById('src');
          tryNode = document.getElementById('Try');
          tensorboard.src = receivedLink;
          newTensorBoard = tensorboard.cloneNode(true);
          tryNode.removeChild(tryNode.childNodes[0]);
          return tryNode.appendChild(newTensorBoard);
        }, true); // turn on for complex data structures.
      };
    }

  };

  DimensionReductionDir.inject('$parse');

  return DimensionReductionDir;

}).call(this);
