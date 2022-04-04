'use strict';
let BaseDirective = require('scripts/BaseClasses/BaseDirective');

let AppMenubarDirective;
module.extend = AppMenubarDirective = class AppMenubarDirective extends BaseDirective {
  initialize() {
    this.restrict = 'E';
    return this.template = require('partials/analysis-nav.jade')();
  }

};

//    @link = (scope, elem, attr) =>
let dirsMod = angular.module('app_directives');

AppMenubarDirective.register(dirsMod, 'menubar');
