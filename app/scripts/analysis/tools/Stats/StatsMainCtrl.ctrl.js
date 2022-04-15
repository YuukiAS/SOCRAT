"use strict";
let BaseCtrl = require("scripts/BaseClasses/BaseController.coffee");

let StatsMainCtrl = function () {
  class StatsMainCtrl extends BaseCtrl{

    initialize() {
      this.$scope.IntroOptions = {
        steps:[
          {
              element: document.querySelector('#stats-step1'),
              intro: "Choose your desired statistical method.\
              You can get the confidence interval for the mean or proporion based on the data.\
              Besides, you can use pilot study to access the feasibility of an approach to be used in a larger scale study."
          },
          {
              element: document.querySelector('#stats-step2'),
              intro: "Choose whether to make use of current data and change confidence level(α).",
              position: 'right'  // it will appear at the right of div
          },
          {
              element: document.querySelector('#stats-step3'),
              intro: 'You can adjust parameters here for the statistical method.',
              position: 'left'
          },
          {
              element: document.querySelector('#stats-step4'),
              intro: "Your plot will be rendered here.",
              position: 'bottom'
          }
          ],
          showStepNumbers: false,
          showBullets: true,
          exitOnOverlayClick: true,  // can be cancelled when clicking background
          exitOnEsc:true,
          nextLabel: 'next',
          prevLabel: 'previous',
          skipLabel: 'skip'
      };
      // required basic modules
      this.d3 = require("d3");
      this.ve = require("vega-embed").default;
      this.vt = require("vega-tooltip");
      this.distribution = require("distributome");
      this.msgService = this.app_analysis_stats_msgService;
      this.algorithmService = this.app_analysis_stats_algorithms;

      this.title = "Stats Analysis Module";
      this.showHelp = false;
      this.selectedAlgorithm = "CI for One Mean";
      this.loadData();
      // * wait for sidebarCtrl to pass new alpha
      this.$scope.$on("stats:alpha", (event, data) => {
        // we must call algorihtmService, since alpha will be sent to other modules
        this.algorithmService.passAlphaByName(this.selectedAlgorithm, data);
        return this.loadData();
      });
      // wait for sidebarCtrl to select new calculator
      this.$scope.$on("stats:updateAlgorithm", (event, data) => {
        this.selectedAlgorithm = data;
        console.log("algorithms updated:", this.selectedAlgorithm);
        this.loadData();
        return MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      });
      // receive data
      return this.$scope.$on("stats:Data", (event, data) => {
        this.algorithmService.passDataByName(this.selectedAlgorithm, data);
        return this.loadData();
      });
    }

    /**
     * load data to a specified calculator
     * @returns
     */
    loadData() {
      if (this.selectedAlgorithm === "CI for One Mean") {
        return this.CIOMRetrieve();
      } else if (this.selectedAlgorithm === "CI for One Proportion") {
        return this.CIOPRetrieve();
      } else if (this.selectedAlgorithm === "Pilot Study") {
        return this.PilotStudyRetrieve();
      } else {
      }
    }

    // outdated
    update_algo(evt) {
      console.log(this.selectedAlgorithm);
      this.selectedAlgorithm = evt.currentTarget.value;
      return this.msgService.broadcast(
        "powercalc:updateAlgorithm_back",
        this.selectedAlgorithm
      );
    }

    // call to update data parameters of specified calculator
    syncData(dataIn) {
      this.algorithmService.setParamsByName(this.selectedAlgorithm, dataIn);
      return this.loadData();
    }

    showHelpToggle() {
      this.showHelp = !this.showHelp;
    }
    // --------------------------------------------------
    // functions for CIOM only
    // retrieve data parameters from specified calculators
    CIOMRetrieve() {
      this.params = this.algorithmService.getParamsByName(
        // this.app_analysis_stats_algorithms -> search in this.algorithms
        this.selectedAlgorithm // it may be changed
      );
      this.CIOMN = this.params.n;
      this.CIOMNMax = this.params.nMax;
      this.CIOMMean = this.params.mu;
      this.CIOMMeanMax = this.params.meanMax;
      this.CIOMStDev = this.params.sigma;
      this.CIOMSigmaMax = this.params.sigmaMax;
      this.CIOMTScore = this.params.t;
      this.CIOMLowerBound = this.params.lowBound;
      this.CIOMUpperBound = this.params.upBound;
      this.CIOMMode = this.params.mode;
      this.CIOMModes = ["Two Tailed", "One Tailed"];
      this.CIOMClick();
      this.CIOMDraw();
    }

    CIOMDraw() {
      var confidenceInterval, opt, title, vlSpec;
      confidenceInterval = [
        {
          lowerBound: this.CIOMLowerBound,
        },
        {
          mean: this.CIOMMean,
        },
        {
          upperBound: this.CIOMUpperBound,
        },
      ];
      title = "LowerBound: ".concat(this.CIOMLowerBound.toString());
      title = title.concat(" Mean: ");
      title = title.concat(this.CIOMMean.toString());
      title = title.concat(" UpperBound: ");
      title = title.concat(this.CIOMUpperBound.toString());
      vlSpec = {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        width: 550,
        height: 200,
        data: {
          values: confidenceInterval,
        },
        layer: [
          {
            mark: {
              type: "point",
              filled: true,
            },
            encoding: {
              x: {
                field: "mean",
                type: "quantitative",
                axis: {
                  title: title,
                },
              },
              color: {
                value: "black",
              },
            },
          },
          {
            mark: "rule",
            encoding: {
              x: {
                aggregate: "ci0",
                field: "lowerBound",
                type: "quantitative",
              },
              x2: {
                aggregate: "ci1",
                field: "upperBound",
                type: "quantitative",
              },
            },
          },
        ],
      };
      opt = {
        mode: "vega-lite",
        actions: {
          export: true,
          source: false,
          editor: true,
        },
      };
      return this.ve("#visCIOM", vlSpec, opt, function (error, result) {}).then(
        (result) => {}
      );
    }

    // call syncData
    CIOMSync() {
      this.params.n = this.CIOMN;
      this.params.mu = this.CIOMMean;
      this.params.sigma = this.CIOMStDev;
      this.params.mode = this.CIOMMode;
      this.syncData(this.params);
    }

    // if user press enter, then sync data parameters
    // otherwise, do nothing
    CIOMPress(evt) {
      var key;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        this.CIOMSync();
      }
    }

    // update all sliders
    // and check deployment of data mode
    CIOMClick() {
      var CIOMMeanUI, CIOMNUI, CIOMSliders, CIOMStDevUI, i, j, len, len1, sl;
      // slider elements
      CIOMNUI = $("#CIOMNUI");
      CIOMMeanUI = $("#CIOMMeanUI");
      CIOMStDevUI = $("#CIOMStDevUI");
      CIOMNUI.slider({
        value: this.CIOMN,
        min: 2,
        max: this.CIOMNMax,
        range: "min",
        step: 1,
        slide: (event, ui) => {
          this.CIOMN = ui.value;
          this.CIOMSync();
          return this.$scope.$apply();
        },
      });
      CIOMMeanUI.slider({
        value: this.CIOMMean,
        min: 0,
        max: this.CIOMMeanMax,
        range: "min",
        step: 0.001,
        slide: (event, ui) => {
          this.CIOMMean = ui.value;
          this.CIOMSync();
          return this.$scope.$apply();
        },
      });
      CIOMStDevUI.slider({
        value: this.CIOMStDev,
        min: 0,
        max: this.CIOMSigmaMax,
        range: "min",
        step: 0.001,
        slide: (event, ui) => {
          this.CIOMStDev = ui.value;
          this.CIOMSync();
          return this.$scope.$apply();
        },
      });
      // enable or disable slider
      CIOMSliders = [CIOMNUI, CIOMMeanUI, CIOMStDevUI];
      if (this.deployed === true) {
        for (i = 0, len = CIOMSliders.length; i < len; i++) {
          sl = CIOMSliders[i];
          sl.slider("disable");
          sl.find(".ui-slider-handle").hide();
        }
      } else {
        for (j = 0, len1 = CIOMSliders.length; j < len1; j++) {
          sl = CIOMSliders[j];
          sl.slider("enable");
          sl.find(".ui-slider-handle").show();
        }
      }
    }
    // ----------------------------------------------------
    // functions for CIOP only
    CIOPRetrieve() {
      this.params = this.algorithmService.getParamsByName(
        this.selectedAlgorithm
      );
      this.CIOPP = this.params.p; //central point
      this.CIOPN = this.params.n; //sample size
      this.CIOPT = this.params.t; //t-score
      this.CIOPTMax = this.params.tMax;
      this.zscore = this.params.z;
      this.upbound = this.params.u; //from confinterval
      this.lowbound = this.params.l;
      this.confinterval = this.params.ci;
      this.ciAlpha = this.params.a; //significance level
      this.standarddev = this.params.sd;
      this.cilevel = 1.0 - this.ciAlpha; //confidence level
      this.CIOPChart(); //show chart
      return this.CIOPClick();
    }

    CIOPSync() {
      this.params.p = this.CIOPP;
      this.params.n = this.CIOPN;
      this.params.t = this.CIOPT;
      return this.syncData(this.params);
    }

    CIOPPress(evt) {
      var key;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        this.CIOMSync();
      }
    }

    /**
     * Set N and T's slider for CIOP
     */
    CIOPClick() {
      // select slider elements(div)
      let CIOPNUI = $("#CIOPNUI"); // for sample size N
      let CIOPTUI = $("#CIOPTUI"); // for total size T
      let sliders = [CIOPNUI, CIOPTUI];
      // * set slider for these divs
      CIOPNUI.slider({
        value: this.CIOPN, // current value
        min: 0,
        max: this.CIOPTMax,
        range: "min",
        step: 1,
        // * slide event for slider
        slide: (event, ui) => {
          this.CIOPN = ui.value;
          this.CIOPSync();
          return this.$scope.$apply();
        },
      });
      CIOPTUI.slider({
        value: this.CIOPT,
        min: 0,
        max: this.CIOPTMax,
        range: "min",
        step: 1,
        slide: (event, ui) => {
          this.CIOPT = ui.value;
          this.CIOPSync();
          return this.$scope.$apply();
        },
      });
      let sl;
      if (this.deployed === true) {
        for (let i = 0, len = sliders.length; i < len; i++) {
          sl = sliders[i];
          sl.slider("disable");
          sl.find(".ui-slider-handle").hide();
        }
      } else {
        for (let j = 0, len1 = sliders.length; j < len1; j++) {
          sl = sliders[j];
          sl.slider("enable");
          sl.find(".ui-slider-handle").show();
        }
      }
    }

    //Chart Visualization
    CIOPChart() {
      var nums, opt, title, vlSpec;
      nums = [
        {
          lower: this.lowbound,
        },
        {
          upper: this.upbound,
        },
        {
          center: this.CIOPP,
        },
      ];
      title = "LowerBound: ".concat(this.lowbound.toFixed(3).toString());
      title = title.concat(" Center: ");
      title = title.concat(this.CIOPP.toFixed(3).toString());
      title = title.concat(" UpperBound: ");
      title = title.concat(this.upbound.toFixed(3).toString());
      vlSpec = {
        width: 550,
        height: 200,
        $schema: "https://vega.github.io/schema/vega-lite/v2.json",
        data: {
          values: nums,
        },
        layer: [
          {
            mark: {
              type: "point",
              filled: true,
            },
            encoding: {
              x: {
                aggregate: "mean",
                field: "center",
                type: "quantitative",
                scale: {
                  zero: false,
                },
                axis: {
                  title: "Interval",
                },
              },
              color: {
                value: "black",
              },
            },
          },
          {
            mark: "rule",
            encoding: {
              x: {
                aggregate: "ci0",
                field: "lower",
                type: "quantitative",
                scale: {
                  zero: false,
                },
              },
              x2: {
                aggregate: "ci1",
                field: "upper",
                type: "quantitative",
              },
            },
          },
        ],
      };
      // Embed the visualization in the container with id `vis`
      opt = {
        mode: "vega-lite",
        actions: {
          export: true,
          source: false,
          editor: true,
        },
      };
      // final visualization
      return this.ve("#visCIOP", vlSpec, opt, function (error, result) {}).then(
        (result) => {}
      );
    }
    // --------------------------------------------------
    //example update function in chi squared service update
    PilotStudyRetrieve() {
      this.params = this.algorithmService.getParamsByName(
        this.selectedAlgorithm
      );
      this.PILOTP = this.params.p; //Percent Under
      this.PILOTR = parseFloat(this.params.r.toPrecision(3)); //Risk Exceeded
      this.PILOTD = this.params.d; //Degrees of Freedom
      this.prMax = this.params.rMax;
      this.pdfMax = this.params.dfMax;
      this.ppMax = this.params.pMax;
      this.PilotClick();
    }

    PilotClick() {
      var PILOTDUI, PILOTPUI, PILOTRUI, i, j, len, len1, sl, sliders;
      //slider elements
      PILOTPUI = $("#PILOTPUI");
      PILOTRUI = $("#PILOTRUI");
      PILOTDUI = $("#PILOTDUI");
      sliders = [PILOTPUI, PILOTDUI, PILOTDUI];
      PILOTPUI.slider({
        value: this.PILOTP,
        min: 0,
        max: this.ppMax,
        range: "min",
        step: 1,
        slide: (event, ui) => {
          this.PILOTP = ui.value;
          this.PilotSync("pctUnder");
          return this.$scope.$apply();
        },
      });
      PILOTRUI.slider({
        value: this.PILOTR,
        min: 0,
        max: this.prMax,
        range: "min",
        step: 0.01,
        slide: (event, ui) => {
          this.PILOTR = ui.value;
          this.PilotSync("risk");
          return this.$scope.$apply();
        },
      });
      PILOTDUI.slider({
        value: this.PILOTD,
        min: 0,
        max: this.pdfMax,
        range: "min",
        step: 1,
        slide: (event, ui) => {
          this.PILOTD = ui.value;
          this.PilotSync("df");
          return this.$scope.$apply();
        },
      });
      PILOTRUI.slider("disable");
      PILOTRUI.find(".ui-slider-handle").hide();
      //enable or disable slider?
      if (this.deployed === true) {
        for (i = 0, len = sliders.length; i < len; i++) {
          sl = sliders[i];
          sl.slider("disable");
          sl.find(".ui-slider-handle").hide();
        }
      } else {
        for (j = 0, len1 = sliders.length; j < len1; j++) {
          sl = sliders[j];
          sl.slider("enable");
          sl.find(".ui-slider-handle").show();
        }
      }
    }

    PilotPress(evt) {
      var key;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        this.PilotSync("pctUnder");
      }
    }

    PilotSync(tar) {
      this.params.p = this.PILOTP;
      this.params.r = this.PILOTR;
      this.params.d = this.PILOTD;
      this.params.tar = tar;
      this.syncData(this.params);
    }

  }

  StatsMainCtrl.inject(
    "app_analysis_stats_msgService",
    "app_analysis_stats_algorithms",
    "$timeout",
    "$scope"
  );


  return StatsMainCtrl;
}.call(this);

module.exports = StatsMainCtrl;



