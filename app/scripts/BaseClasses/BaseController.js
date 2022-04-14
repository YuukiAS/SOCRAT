'use strict';

/**
 * Base class for Angular controllers. Subclasses need to implement initialize().
 */
class BaseCtrl {

  static register(module, name) {
    let ref;
    if (name == null) {
      name = this.name || ((ref = this.toString().match(/function\s*(.*?)\(/)) != null ? ref[1] : void 0);
    }
    return module.controller(name, this);
  }

  static inject(...annotations) {
    let ANNOTATION_REG = /^(\S+)(\s+as\s+(\w+))?$/;
    this.annotations = annotations.map(function(annotation) {
      let match;
      match = annotation.match(ANNOTATION_REG);
      return {
        name: match[1],
        identifier: match[3] || match[1]
      };
    });
    return this.$inject = this.annotations.map(function(annotation) {
      return annotation.name;
    });
  }

  constructor(...dependencies) {
    if (dependencies.length) {
      let ref = this.constructor.annotations;
      let annotation, i, index, len;
      for (index = i = 0, len = ref.length; i < len; index = ++i) {
        annotation = ref[index];
        this[annotation.identifier] = dependencies[index];
      }
      if (typeof this.initialize === "function") {
        this.initialize(); // will be defined in extended class
      }
    }
  }

};

module.exports = BaseCtrl;
// export default BaseCtrl;
