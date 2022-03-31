'use strict';

/*
  @name Module
  @desc Base class for SOCRAT module prototyping
*/

export default class Module {
  id: string;
  components: object;
  state: object;
  deps: []

  static defaultComponents = {
    services: {
      initService: null,
      messageService: null
    },
    controllers: [],
    directives: [],
    runBlock: null
  };

  static defaultState = {
    id: null,
    url: null,
    views: {
      main: {
        template: null
      },
      sidebar: {
        template: null
      }
    }
  };

  constructor(id?, components?, state?, deps?) {
    this.id = id || null;
    this.components = components || Module.defaultComponents;
    this.state = state || Module.defaultState;
    this.deps = deps || [];

    // ? It seems that module isn't used
    // if (this.id != null) {
    //   let module = angular.module(this.id, this.deps);
    // }
  }
};

