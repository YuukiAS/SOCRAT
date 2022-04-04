'use strict';
let BaseDirective = require('scripts/BaseClasses/BaseDirective');

var AppNotificationDirective;


module.exports = AppNotificationDirective = class AppNotificationDirective extends BaseDirective {
  initialize() {
    this.restrict = 'E';
    this.transclude = true;
    this.template = '<div></div>';
    //    @controllerAs = 'notificationCtrl'
    //    @controller = (@$scope)->
    return this.link = function(scope, elem, attr) {
      scope.update = function(evt, args) {
        var _change, duration, f, failureCallback, i, successCallback;
        //args should contain
        // initialMsg:
        // type
        // promise object
        // finalMsg:
        // type
        // duration
        _change = function(obj) {
          elem.removeClass().addClass('alert');
          elem.addClass(obj.type);
          elem.css('display', 'block').css('z-index', '9999').css('position', 'fixed');
          return elem.html(obj.msg);
        };
        if (args != null) {
          duration = args.duration || 3000;
          if ((f = args.final) != null) {
            _change(f);
            setTimeout(function() {
              elem.html('');
              return elem.css('display', 'none');
            }, duration);
            return false;
          }
          if ((i = args.initial) != null) {
            _change(i);
            successCallback = function() {
              _change(args.success);
              return setTimeout(function() {
                elem.html('');
                return elem.css('display', 'none');
              }, duration);
            };
            failureCallback = function() {
              _change(args.failure);
              return setTimeout(function() {
                elem.html('');
                return elem.css('display', 'none');
              }, duration);
            };
            // once the promise is resolved
            return args.promise.then(successCallback, failureCallback);
          }
        }
      };
      return scope.$on('app:push notification', scope.update);
    };
  }

};

let dirsMod = angular.module('app_directives');

AppNotificationDirective.register(dirsMod, 'notification');
