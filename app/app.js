'use strict';
/*
  NOTE: Order of the modules injected into "app" module decides
  which module gets initialized first.
  Their config blocks are executed in the injection order.
  After that config block of "app" is executed.
  Then the run blocks are executed in the same order.
  Run block of "app" is executed in the last.
*/
// base libraries
require('core-js');

require('regenerator-runtime');

let $ = require('jquery');

require('angular');

require('bootstrap/dist/css/bootstrap.css');

require('angular-ui-bootstrap');

// require 'imports-loader?this=>window!bootstrap-switch'
require('bootstrap-switch');

require('holderjs');

require('typeahead.js');

require('select2');

require('angular-bootstrap-switch');

require('designmodo-flat-ui/dist/css/flat-ui.min.css');

require('designmodo-flat-ui/dist/fonts/glyphicons/flat-ui-icons-regular.woff');

require('designmodo-flat-ui/dist/fonts/lato/lato-black.woff');

require('designmodo-flat-ui/dist/fonts/lato/lato-bold.woff');

require('designmodo-flat-ui/dist/fonts/lato/lato-bolditalic.woff');

require('designmodo-flat-ui/dist/fonts/lato/lato-italic.woff');

require('designmodo-flat-ui/dist/fonts/lato/lato-light.woff');

require('designmodo-flat-ui/dist/fonts/lato/lato-regular.woff');

require('flatui-radiocheck');

require('angular-ui-router');

require('angular-sanitize');

require('angular-cookies');

require('angular-resource');

require('styles/app.less');

require('d3');

// TODO: consider relocating to Charts
// require("expose-loader?vega!vega")
// require("expose-loader?vl!vega-lite")
require('vega');

require('vega-lite');

require('vega-embed');

// * For newly added modules ---------

const introJS = require('intro.js/intro.js')

require('intro.js/minified/introjs.min.css')
require('intro.js/themes/introjs-modern') // set theme

require('angular-intro.js')

// create app-level modules
angular.module('app_services', []);

angular.module('app_controllers', []);

angular.module('app_directives', []);

// base app components
require('scripts/App/AppCtrl.coffee');

require('scripts/App/AppSidebarCtrl.coffee');

require('scripts/App/AppMainCtrl.coffee');

require('scripts/App/AppMenubarDirective.js');

require('scripts/App/AppNotification.directive.js');

require('scripts/App/filters.coffee');

require('scripts/App/services.coffee');

let bodyTemplate = require('index.jade');

document.body.innerHTML = bodyTemplate();

// load app configs
let ModuleList = require('scripts/App/AppModuleList.js');
let moduleList = new ModuleList();

let AppConfig = require('scripts/App/AppConfig.js');
let appConfig = new AppConfig(moduleList);

// create an instance of Core
let core = require('scripts/core/Core.js');

// Create app module and pass all modules as dependencies
// Config block
// Run block
console.log("moduleList is ", moduleList.listAll())

let modules =  moduleList.listAll();
// todo: Add introJS support
// modules.push('angular-intro')

angular.module('app', modules)  // def modules is a list of dependencies (modules)
       .config(appConfig.getConfigBlock())
       .run(appConfig.getRunBlock());
