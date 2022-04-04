function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}

module.exports = class BaseDirective {

  static register(module, name) {
    if (name == null) { name = this.name || __guard__(this.toString().match(/function\s*(.*?)\(/), x => x[1]); }

    return module.directive(name, (function(_selfPtr) {
      const directive = (...dependencies) => new _selfPtr(dependencies);
      if (_selfPtr.annotations != null) {
        directive.$inject = _selfPtr.annotations.map(annotation => annotation.name);
      }
      return directive;
    })(this)
    );
  }

  // inject the list of dependencies
  static inject(...annotations) {
    const ANNOTATION_REG = /^(\S+)(\s+as\s+(\w+))?$/;

    // annotations.unshift '$scope' if not '$scope' in args
    return this.annotations = annotations.map(function(annotation) {
      const match = annotation.match(ANNOTATION_REG);
      return {name: match[1], identifier: match[3] || match[1]};});
  }

  constructor(dependencies) {
    if (dependencies.length) {
      for (let index = 0; index < this.constructor.annotations.length; index++) {
        const annotation = this.constructor.annotations[index];
        this[annotation.identifier] = dependencies[index];
      }
    }

    // return an object with directive content defined in child class
    if (typeof this.initialize === 'function') {
      this.initialize();
    }
  }
};


