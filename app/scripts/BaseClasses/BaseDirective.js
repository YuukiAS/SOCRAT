module.exports = class BaseDirective {

  /**
   * Make sure transform isn't applied to an undefined or null value
   * @param {*} value
   * @param {*} transform
   * @returns Transfored value or undefined, if value is undefined or null
   */
  __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
  }

  /**
   *
   * @param {*} module
   * @param {*} name
   * @returns A generated directive
   */
  static register(module, name) {
    if (name == null) { name = this.name || __guard__(this.toString().match(/function\s*(.*?)\(/), x => x[1]); }

    return module.directive(name, (function (_selfPtr) {
      const directive = (...dependencies) => new _selfPtr(dependencies);
      if (_selfPtr.annotations != null) {
        directive.$inject = _selfPtr.annotations.map(annotation => annotation.name);
      }
      return directive;
    })(this)
    );
  }

  /**
   * Inject the list of dependencies
   * @param  {...any} annotations
   * @returns
   */
  static inject(...annotations) {
    const ANNOTATION_REG = /^(\S+)(\s+as\s+(\w+))?$/;

    // annotations.unshift '$scope' if not '$scope' in args
    return this.annotations = annotations.map(function (annotation) {
      const match = annotation.match(ANNOTATION_REG);
      return { name: match[1], identifier: match[3] || match[1] };
    });
  }

  constructor(dependencies) {
    if (dependencies.length) {
      for (let index = 0; index < this.constructor.annotations.length; index++) {
        const annotation = this.constructor.annotations[index];
        this[annotation.identifier] = dependencies[index];
      }
    }

    // will call the initialize method during startup
    if (typeof this.initialize === 'function') {
      // * initialize() function should be implemented by subClass
      this.initialize();
    }
  }
};


