'use strict';
/*
  @name:
  @type: controller
  @desc: Main controller
*/
let BaseCtrl = require('scripts/BaseClasses/BaseController.coffee');

let ModelerMainCtrl;

module.exports = ModelerMainCtrl = (function() {
  class ModelerMainCtrl extends BaseCtrl {
    initialize() {
      this.dataService = this.app_analysis_modeler_dataService;
      this.DATA_TYPES = this.dataService.getDataTypes();
      this.router = this.app_analysis_modeler_router;
      this.title = 'Modeler';
      this.dataType = '';
      this.dataPoints = null;
      this.assignments = null;
      this.distribution = 'Normal';
      this.stats = null;
      this.modelData = {};
      this.params = {};
      this.tempData = {};
      this.getParams = this.app_analysis_modeler_getParams;
      //@gMean = 0
      //@gVariance =0
      //@gstandardDev = null
      //@loadData()
      this.$scope.$on('modeler:updateDataPoints', (event, data) => {
        //@showresults = off if @showresults is on
        // safe enforce $scope.$digest to activate directive watchers
        return this.$timeout(() => {
          return this.updateChartData(data);
        });
      });
      return this.$scope.$on('modeler:updateDataType', (event, dataType) => {
        //console.log("broadcast occurered, updating datatTYPE")
        return this.dataType = dataType;
      });
    }

    //imports the data from the side bar message service, syncs data to the distribution component
    updateChartData(data) {
      var histData;
      if (data.dataPoints != null) {
        this.distribution = data.distribution.name;
        this.tempData = data;
        histData = data.dataPoints;
        histData = histData.map(function(row) {
          return {
            x: row[0],
            y: row[1],
            z: row[2],
            r: row[3]
          };
        });
        this.stats = this.getParams.getParams(data);
        this.params.stats = this.stats;
        this.router.setParamsByName(this.distribution, this.params);
        this.params.xMin = d3.min(histData, function(d) {
          return parseFloat(d.x);
        });
        this.params.xMax = d3.max(histData, function(d) {
          return parseFloat(d.x);
        });
        //To be added for quantile
        //console.log(@distribution)
        //console.log(@params)
        return this.syncData(this.params);
      }
    }

    //takes the current parameters, distribution and datset and updates the graph data accordingly
    //graph data is two way binded to the modeler viz
    updateModelData() {
      var graph, modelData, xBounds, yBounds;
      //console.log("Updating Model Data from Sliders")
      xBounds = this.getXbounds(this.params, this.distribution);
      this.params.xMin = xBounds.xMin;
      this.params.xMax = xBounds.xMax;
      modelData = this.router.getChartData(this.distribution, this.params);
      modelData.stats = this.params;
      //tempData.bounds = xBounds
      yBounds = this.getYBounds(modelData);
      this.tempData.bounds = this.getYBounds(modelData);
      modelData.yMax = yBounds.yMax;
      //@tempData.modelData = modelData
      graph = {};
      graph.distribution = this.distribution;
      graph.chartData = this.tempData;
      graph.modelData = modelData;
      //console.log("updating graph data from main controller")
      return this.$timeout(() => {
        return this.graphData = graph;
      }, 1);
    }

    //@chartData = @tempData
    //@$timeout => @modelData = modelData,
    //5

      //returns the top and bottom bound for the x axis
    //compares (takes min) the dataset min to the model distribution 1st percentile
    //compares (takes max) the dataset max to the model distribution 99st percentile
    getXbounds(params, distribution) {
      var bounds, dataSetxMax, dataSetxMin;
      this.params = params;
      this.distribution = distribution;
      dataSetxMin = this.params.xMin;
      dataSetxMax = this.params.xMax;
      // modelDataFirstQuantile = @router.getQuantile(@distribution, @params, 0.01)
      // modelDataNNQuantile = @router.getQuantile(@distribution, @params, 0.99)
      // xMin = Math.min(modelDataFirstQuantile, dataSetxMin)
      // xMax = Math.max(modelDataNNQuantile, dataSetxMax)
      //buggggggy value
      return bounds = {
        xMin: dataSetxMin,
        xMax: dataSetxMax
      };
    }

    //returns the maximium y valuable to be plotted from the model data.
    getYBounds(modelData) {
      var bounds, modelDataYMax;
      modelDataYMax = d3.max(modelData, function(d) {
        return parseFloat(d.y);
      });
      return bounds = {
        yMax: modelDataYMax
      };
    }

    //sets the distribution to the updated parameters
    //reloads the data to be plotted
    syncData(dataIn) {
      this.router.setParamsByName(this.distribution, dataIn);
      return this.loadData();
    }

    //implementation of the reset button, restores to original extracted parameters
    resetGetParams() {
      this.stats = this.getParams.getParams(this.graphData.chartData);
      this.params.stats = this.stats;
      return this.syncData(this.params);
    }

    //loads the proper distribution
    loadData() {
      if (this.distribution === "Normal") {
        this.normalRetrieve();
      } else if (this.distribution === "Laplace") {
        this.laplaceRetrieve();
      } else if (this.distribution === "Cauchy") {
        return this.CauchyRetrieve();
      } else if (this.distribution === "ChiSquared") {
        return this.ChiSquaredRetrieve();
      } else if (this.distribution === "LogNormal") {
        return this.LogNormalRetrieve();
      } else if (this.distribution === "Maxwell-Boltzman") {
        return this.MaxBoltRetrieve();
      } else if (this.distribution === "Exponential") {
        return this.ExponentialRetrieve();
      } else if (this.distribution === "Kernel") {
        return this.KernelRetrieve();
      } else if (this.distribution === "Geometric") {
        return this.GeomRetrieve();
      } else if (this.distribution === "Bernoulli") {
        return this.BernoulliRetrieve();
      } else if (this.distribution === "ContinuousUniform") {
        return this.ContinuousUniformRetrieve();
      } else if (this.distribution === "DiscreteUniform") {
        return this.DiscreteUniformRetrieve();
      } else if (this.distribution === "Poisson") {
        return this.PoissonRetrieve();
      } else if (this.distribution === "Weibull") {
        return this.WeibullRetrieve();
      } else {

      }
    }

    WeibullRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.gamma = this.currParams.gamma;
      //@geomK = @currParams.geomK
      this.NormalMean = this.gamma;
      //@NormalVariance = @geomK
      this.NormalSliders();
      return this.updateModelData();
    }

    PoissonRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.geomLambda = this.currParams.lambda;
      //@geomK = @currParams.geomK
      this.NormalMean = this.geomLambda;
      //@NormalVariance = @geomK
      this.NormalSliders();
      return this.updateModelData();
    }

    DiscreteUniformRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.geomP = this.currParams.geomP;
      //@geomK = @currParams.geomK
      this.NormalMean = this.geomP;
      //@NormalVariance = @geomK
      this.NormalSliders();
      return this.updateModelData();
    }

    ContinuousUniformRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.geomB = this.currParams.geomB;
      this.geomA = this.currParams.geomA;
      this.NormalMean = this.geomB;
      this.NormalVariance = this.geomA;
      this.NormalSliders();
      return this.updateModelData();
    }

    BernoulliRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.geomP = this.currParams.geomP;
      this.geomN = this.currParams.geomN;
      this.NormalMean = this.geomP;
      this.NormalVariance = this.geomN;
      this.NormalSliders();
      return this.updateModelData();
    }

    GeomRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.geomP = this.currParams.geomP;
      this.geomK = this.currParams.geomK;
      this.NormalMean = this.geomP;
      this.NormalVariance = this.geomK;
      this.NormalSliders();
      return this.updateModelData();
    }

    //gets the current values of the distribution parameters
    normalRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.NormalStDev = this.currParams.standardDev;
      this.NormalMean = this.currParams.mean;
      this.NormalVariance = this.currParams.variance;
      this.NormalSliders();
      return this.updateModelData();
    }

    //updates the parameters object to the UI sliders, then syncs data
    NormalSync() {
      this.params.stats.mean = this.NormalMean;
      this.params.stats.standardDev = this.NormalStDev;
      this.params.stats.variance = this.NormalVariance;
      return this.syncData(this.params);
    }

    //@loadData()

      //handles a user pressing enter instead of using sliders
    NormalPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "Normal") {
          return this.NormalSync();
        }
      }
    }

    //binded to the front end slider
    NormalSliders() {
      var i, j, len, len1, nMean, nStDev, nVariance, results, results1, sl, sliders;
      // select slider elements
      nMean = $("#NormalMean");
      nStDev = $("#NormalStDev");
      nVariance = $("#NormalVariance");
      nMean.slider({
        value: this.NormalMean,
        min: 0.01,
        max: 30,
        range: "min",
        step: .5,
        slide: (event, ui) => {
          this.NormalMean = ui.value;
          return this.NormalSync();
        }
      });
      // nStDev.slider(
      //   value: @NormalStDev,
      //   min: 0.01,
      //   max: 10,
      //   range: "min",
      //   step: .2,
      //   slide: (event, ui) =>
      //     @NormalStDev = ui.value
      //     @NormalSync()
      // )
      nVariance.slider({
        value: this.NormalVariance,
        min: 0.01,
        max: 10,
        range: "min",
        step: 0.2,
        slide: (event, ui) => {
          this.NormalVariance = ui.value;
          return this.NormalSync();
        }
      });
      // enable or disable sliders
      sliders = [nMean, nVariance];
      // ,
      //   nStDev
      if (this.deployed === true) {
        results = [];
        for (i = 0, len = sliders.length; i < len; i++) {
          sl = sliders[i];
          sl.slider("disable");
          results.push(sl.find('.ui-slider-handle').hide());
        }
        return results;
      } else {
        results1 = [];
        for (j = 0, len1 = sliders.length; j < len1; j++) {
          sl = sliders[j];
          sl.slider("enable");
          results1.push(sl.find('.ui-slider-handle').show());
        }
        return results1;
      }
    }

    laplaceRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.LaplaceMean = this.currParams.mean;
      this.LaplaceScale = this.currParams.scale;
      this.LaplaceSliders();
      return this.updateModelData();
    }

    LaplaceSync() {
      this.params.stats.mean = this.LaplaceMean;
      this.params.stats.scale = this.LaplaceScale;
      return this.syncData(this.params);
    }

    LaplacePress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "Laplace") {
          return this.LaplaceSync();
        }
      }
    }

    LaplaceSliders() {
      var lMean, lScale;
      lMean = $("#LaplaceMean");
      lScale = $("#LaplaceScale");
      lMean.slider({
        value: this.LaplaceMean,
        min: 0.01,
        max: 30,
        range: "min",
        step: .5,
        slide: (event, ui) => {
          this.LaplaceMean = ui.value;
          return this.LaplaceSync();
        }
      });
      return lScale.slider({
        value: this.LaplaceScale,
        min: 0.01,
        max: 10,
        range: "min",
        step: .2,
        slide: (event, ui) => {
          this.LaplaceScale = ui.value;
          return this.LaplaceSync();
        }
      });
    }

    CauchyRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.CauchyLocation = this.currParams.location;
      this.CauchyGamma = this.currParams.gamma;
      this.CauchySliders();
      return this.updateModelData();
    }

    CauchySync() {
      this.params.stats.location = this.CauchyLocation;
      this.params.stats.gamma = this.CauchyGamma;
      return this.syncData(this.params);
    }

    CauchyPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "Cauchy") {
          return this.CauchySync();
        }
      }
    }

    CauchySliders() {
      var cGamma, cLocation;
      cLocation = $("#CLocation");
      cGamma = $("#CGamma");
      cLocation.slider({
        value: this.CauchyLocation,
        min: 0.01,
        max: 10,
        range: "min",
        step: .2,
        slide: (event, ui) => {
          this.CauchyLocation = ui.value;
          return this.CauchySync();
        }
      });
      return cGamma.slider({
        value: this.CauchyGamma,
        min: 0.01,
        max: 10,
        range: "min",
        step: .2,
        slide: (event, ui) => {
          this.CauchyGamma = ui.value;
          return this.CauchySync();
        }
      });
    }

    ChiSquaredRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.k = this.currParams.mean;
      this.ChiSquaredSliders();
      return this.updateModelData();
    }

    ChiSquaredSync() {
      this.params.stats.mean = this.k;
      return this.syncData(this.params);
    }

    ChiSquaredPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "ChiSquared") {
          return this.ChiSquaredSync();
        }
      }
    }

    ChiSquaredSliders() {
      var kMean;
      kMean = $("#ChiSquared");
      return kMean.slider({
        value: this.k,
        min: 0.01,
        max: 10,
        range: "min",
        step: .5,
        slide: (event, ui) => {
          this.k = ui.value;
          return this.ChiSquaredSync();
        }
      });
    }

    ExponentialRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.gamma = this.currParams.gamma;
      this.ExponentialSliders();
      return this.updateModelData();
    }

    ExponentialSync() {
      this.params.stats.gamma = this.gamma;
      return this.syncData(this.params);
    }

    ExponentialPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "Exponential") {
          return this.ExponentialSync();
        }
      }
    }

    ExponentialSliders() {
      var ExpGam;
      ExpGam = $("#ExponentialGamma");
      return ExpGam.slider({
        value: this.gamma,
        min: 0.01,
        max: 10,
        range: "min",
        step: .5,
        slide: (event, ui) => {
          this.gamma = ui.value;
          return this.ExponentialSync();
        }
      });
    }

    LogNormalRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.LogNormalStDev = this.currParams.standardDev;
      this.LogNormalMean = this.currParams.mean;
      //console.log("in log normal retrieve!!!!!")
      this.LogNormalSliders();
      return this.updateModelData();
    }

    LogNormalSync() {
      this.params.stats.mean = this.LogNormalMean;
      this.params.stats.standardDev = this.LogNormalStDev;
      return this.syncData(this.params);
    }

    LogNormalPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "LogNormal") {
          return this.LogNormalSync();
        }
      }
    }

    LogNormalSliders() {
      var i, j, len, len1, logMean, logStDev, results, results1, s3, sliders;
      logMean = $("#LogNormalMean");
      logStDev = $("#LogNormalStDev");
      logMean.slider({
        value: this.LogNormalMean,
        min: 0.01,
        max: 10,
        range: "min",
        step: .1,
        slide: (event, ui) => {
          this.LogNormalMean = ui.value;
          return this.LogNormalSync();
        }
      });
      logStDev.slider({
        value: this.LogNormalStDev,
        min: 0.01,
        max: 10,
        range: "min",
        step: .2,
        slide: (event, ui) => {
          this.LogNormalStDev = ui.value;
          return this.LogNormalSync();
        }
      });
      // enable or disable sliders
      sliders = [logMean, logStDev];
      if (this.deployed === true) {
        results = [];
        for (i = 0, len = sliders.length; i < len; i++) {
          s3 = sliders[i];
          s3.slider("disable");
          results.push(s3.find('.ui-slider-handle').hide());
        }
        return results;
      } else {
        results1 = [];
        for (j = 0, len1 = sliders.length; j < len1; j++) {
          s3 = sliders[j];
          s3.slider("enable");
          results1.push(s3.find('.ui-slider-handle').show());
        }
        return results1;
      }
    }

    MaxBoltRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.MaxBoltA = this.currParams.A;
      this.MaxBoltSliders();
      return this.updateModelData();
    }

    MaxBoltSync() {
      this.params.stats.A = this.MaxBoltA;
      return this.syncData(this.params);
    }

    MaxBoltPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "Maxwell-Boltzman") {
          return this.MaxBoltSync();
        }
      }
    }

    MaxBoltSliders() {
      var a;
      a = $("#MaxBolt");
      return a.slider({
        value: this.MaxBoltA,
        min: 0.01,
        max: 30,
        range: "min",
        step: .2,
        slide: (event, ui) => {
          this.MaxBoltA = ui.value;
          return this.MaxBoltSync();
        }
      });
    }

    KernelRetrieve() {
      this.currParams = this.router.getParamsByName(this.distribution);
      this.kBandwith = this.currParams.bandwith;
      this.kernelSliders();
      return this.updateModelData();
    }

    kernelSync() {
      this.params.stats.bandwith = this.kBandwith;
      return this.syncData(this.params);
    }

    kernelPress(evt) {
      var key, name;
      name = evt.target.name;
      key = evt.which || evt.keyCode;
      if (key === 13) {
        if (name === "kernel") {
          return this.kernelSync();
        }
      }
    }

    kernelSliders() {
      var kBandwith;
      kBandwith = $("#kernelBandwidth");
      return kBandwith.slider({
        value: this.kBandwith,
        min: 0.01,
        max: 30,
        range: "min",
        step: .5,
        slide: (event, ui) => {
          this.kBandwith = ui.value;
          return this.kernelSync();
        }
      });
    }

  };

  ModelerMainCtrl.inject('app_analysis_modeler_dataService', 'app_analysis_modeler_getParams', 'app_analysis_modeler_router', '$timeout', '$scope');

  return ModelerMainCtrl;

}).call(this);
