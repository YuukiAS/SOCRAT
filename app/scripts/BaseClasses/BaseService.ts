let BaseService;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}

export default BaseService = class BaseService {
  initialize: any;
  annotations: [];

  static register(module, name) {
    if (name == null) { name = this.name || __guard__(this.toString().match(/function\s*(.*?)\(/), x => x[1]); }
    return module.service(name, this);
  }

  // inject the list of dependencies
  static inject(...annotations) {
    const ANNOTATION_REG = /^(\S+)(\s+as\s+(\w+))?$/;

    this.annotations = annotations.map(function(annotation) {
      const match = annotation.match(ANNOTATION_REG);
      return {name: match[1], identifier: match[3] || match[1]};
    });

    return this.$inject = this.annotations.map(annotation => annotation.name);
  }

  constructor(...dependencies) {
    if (dependencies.length) {
      for (let index = 0; index < this.constructor.annotations.length; index++) {
        const annotation = this.constructor.annotations[index];
        this[annotation.identifier] = dependencies[index];
      }
    }

    if (typeof this.initialize === 'function') {
      this.initialize();
    }
  }
};


