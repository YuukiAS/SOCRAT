'use strict';

let Module = require('scripts/BaseClasses/BaseModule.coffee');
/*
 * @name AppConfig
 * @desc Class for config block of application module
 */
module.exports = class AppRoute {
  constructor(modules1) {
    this.linkDynamic = this.linkDynamic.bind(this);
    this.modules = modules1;
  }

  // def for home, guide and contact page
  linkStatic($stateProvider) {
    return $stateProvider.state('home', {
      url: '/home',
      views: {
        'main': {
          template: require('partials/nav/home.jade')()
        },
        'sidebar': {
          template: require('partials/projects.jade')()
        }
      }
    }).state('guide', {
      url: '/guide',
      views: {
        'main': {
          template: require('partials/nav/guide-me.jade')()
        },
        'sidebar': {
          template: require('partials/projects.jade')()
        }
      }
    }).state('contact', {
      url: '/contact',
      views: {
        'main': {
          template: require('partials/nav/contact.jade')()
        }
      }
    });
  }

  // def for other pages
  linkDynamic($stateProvider, modules = this.modules) {
    var i, k, len, module, ref, results, v;
    results = [];
    for (i = 0, len = modules.length; i < len; i++) {
      module = modules[i];
      if (module instanceof Module) {
        // check if module has state
        if (((ref = module.state) != null ? ref.url : void 0) != null) {
          results.push($stateProvider.state(module.id, {
            url: module.state.url,
            views: {
              'main': {
                template: module.state.mainTemplate()
              },
              'sidebar': {
                template: module.state.sidebarTemplate()
              }
            }
          }));
        } else {
          results.push(void 0);
        }
      } else {
        results.push(this.linkDynamic($stateProvider, ((function() {
          var results1;
          results1 = [];
          for (k in module) {
            v = module[k];
            results1.push(v);
          }
          return results1;
        })())[0]));
      }
    }
    return results;
  }

  getRouter($locationProvider, $urlRouterProvider, $stateProvider, $qProvider) {
    $urlRouterProvider.when('/', '/').otherwise('/home');
    // add states for static components
    this.linkStatic($stateProvider);
    // dynamically add state for analysis/tool modules
    this.linkDynamic($stateProvider);
    // Without server side support html5 must be disabled.
    $locationProvider.html5Mode(false);
    // addressing https://docs.angularjs.org/guide/migration#commit-aa077e8
    $locationProvider.hashPrefix('');
    // fixing https://github.com/angular-ui/ui-router/issues/2889
    $qProvider.errorOnUnhandledRejections(false);
    return console.log('app: routing is set up');
  }

};
