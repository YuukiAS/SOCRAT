"use strict";

let BaseCtrl = require("scripts/BaseClasses/BaseController.coffee");
let indexOf = [].indexOf;

let StatsSidebarCtrl = function () {
  class StatsSidebarCtrl extends BaseCtrl {
    initialize() {
      // initialing all modules
      this.dataService = this.app_analysis_stats_dataService;
      this.msgService = this.app_analysis_stats_msgService;
      this.algorithmsService = this.app_analysis_stats_algorithms;
      // all alglorithms
      this.algorithms = [
        "Select",
        "CI for One Mean",
        "CI for One Proportion",
        "Pilot Study",
      ];
      // select first calculator
      this.selectedAlgorithm = this.algorithms[1];
      // set up data and algorithm-agnostic controls
      this.DATA_TYPES = this.dataService.getDataTypes();
      this.dataFrame = null;
      this.dataType = null;
      this.numericalCols = [];
      this.categoricalCols = [];
      this.subCategoricalCols = [];
      this.labelCol = ["none"];
      this.df = null;
      // sidebar letiables needed to process data
      this.newTarget = true;
      this.curTarget = ["", ""];
      this.chosenColsOne = null;
      this.chosenColsTwo = [];
      this.chosenCats = null;
      this.chosenSubCatsOne = [];
      this.chosenSubCatsTwo = [];
      this.alpha = 0.01;
      this.thresh = 0;
      // pre-processed data container
      this.container = {}; // {name1:[#,#,#,#,#,#....], name2:[#,#,#,#,#,#,#,#.....]}
      this.MinMax = [
        {
          min: 0,
          max: 1,
        },
        {
          min: 0,
          max: 1,
        },
      ];
      this.populations = {};
      $("#toggleDataDriven").bootstrapSwitch();
      $("#toggleThresh").bootstrapSwitch();
      $("#twoPropToggleThresh").bootstrapSwitch();
      // data-driven mode toggle
      $("#toggleDataDriven").on("switchChange.bootstrapSwitch", () => {
        this.deployed = !this.deployed;
        return this.msgService.broadcast("stats:changeMode", {
          deploy: this.deployed,
        });
      });
      // thresh mode toggle
      $("#toggleThresh").on("switchChange.bootstrapSwitch", () => {
        return (this.threshMode = !this.threshMode);
      });
      $("#twoPropToggleThresh").on("switchChange.bootstrapSwitch", () => {
        return (this.threshMode = !this.threshMode);
      });
      // initialize slider
      this.slider();
      // receive raw data
      this.dataService.getData().then((obj) => {
        if (
          obj.dataFrame &&
          obj.dataFrame.dataType != null &&
          obj.dataFrame.dataType === this.DATA_TYPES.FLAT
        ) {
          if (this.dataType !== obj.dataFrame.dataType) {
            // update local data type
            this.dataType = obj.dataFrame.dataType;
            // send update to main are actrl
            this.msgService.broadcast(
              "stats:updateDataType",
              obj.dataFrame.dataType
            );
          }
          // make local copy of data
          this.dataFrame = obj.dataFrame;
          // parse dataFrame
          this.df = obj.dataFrame;
          return this.parseData(obj.dataFrame);
        } else {
          // TODO: add processing for nested object
          return console.log("NESTED DATASET");
        }
      });
      // receive updated algorithm broadcasted from mainArea
      return this.$scope.$on("stats:updateAlgorithmBack", (event, data) => {
        return (this.selectedAlgorithm = data);
      });
    }

    /**
     * Once the algorithm is updated, broadcast to mainArea
     * @returns 
     */
    updateAlgControls() {
      //broadcast algorithms to main controller
      return this.msgService.broadcast(
        "stats:updateAlgorithm",
        this.selectedAlgorithm
      );
    }

    /**
     * Called right after receiving the raw data
     * categorize data types into numeric or names
     * No need to modify this method unless permitted
     * @returns 
     */
    parseData() {
      return this.dataService.inferDataTypes(this.df, (resp) => {
        let header, i, id, idx, j, len, len1, ref, ref1, results, type;
        if (
          resp != null &&
          resp.dataFrame != null &&
          resp.dataFrame.data != null
        ) {
          ref = this.df.types;
          //update data types
          for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
            type = ref[idx];
            this.df.types[idx] = resp.dataFrame.data[idx];
          }
          // if the column is numeric, append the header name to @numericalCols
          // if the column is string, append the header name to @categoricalCols
          this.numericalCols = [];
          this.categoricalCols = ["none"];
          id = 0;
          ref1 = this.df.types;
          results = [];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            header = ref1[j];
            if (header === "number" || header === "integer") {
              this.numericalCols.push(this.df.header[id]);
            } else if (header === "string") {
              this.categoricalCols.push(this.df.header[id]);
            }
            results.push((id += 1));
          }
          return results;
        }
      });
    }

    // called when sidebar updates letiables
    // 1. update categories and its subcategories
    // 2. push all the related data into its own category
    update() {
      let i, index, len, ref, ref1, results, row;
      index = this.df.header.indexOf(this.chosenCats);
      this.container = {};
      this.subCategoricalCols = [];
      ref = this.df.data;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        row = ref[i];
        if (!(row[index] in this.container)) {
          this.container[row[index]] = [];
        }
        if (
          ((ref1 = row[index]), indexOf.call(this.subCategoricalCols, ref1) < 0)
        ) {
          this.subCategoricalCols.push(row[index]);
        }
        results.push(this.container[row[index]].push(row));
      }
      return results;
    }

    // call specified pre-processor
    run() {
      if (this.selectedAlgorithm === "CI for One Mean") {
        this.CIOM();
      }
      if (this.selectedAlgorithm === "CI for One Proportion") {
        return this.CIOP();
      }
    }

    CIOM() {
      let i, index, index1, j, len, len1, ref, ref1, row;
      this.populations = {};
      // if compare two different letiables, calculate separately
      if (this.chosenCats !== "none" && this.chosenCats !== void 0) {
        //extract index if col
        index = this.df.header.indexOf(this.chosenColsOne);
        //extract data from container to population
        this.populations[this.chosenSubCatsOne] = [];
        ref = this.container[this.chosenSubCatsOne];
        for (i = 0, len = ref.length; i < len; i++) {
          row = ref[i];
          this.populations[this.chosenSubCatsOne].push(row[index]);
        }
      } else {
        // extract data from data to population
        index1 = this.df.header.indexOf(this.chosenColsOne);
        this.populations[this.chosenColsOne] = [];
        ref1 = this.df.data;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          row = ref1[j];
          this.populations[this.chosenColsOne].push(row[index1]);
        }
      }
      return this.msgService.broadcast("stats:Data", {
        popl: this.populations,
      });
    }

    CIOP() {
      this.populations = 0;
      this.samplesize = this.df.data.length;
      // if compare two different letiables, calculate separately
      if (this.chosenCats !== "none" && this.chosenCats !== void 0) {
        console.log(this.container[this.chosenSubCatsOne].length);
        //extract data from container to population
        this.populations = this.container[this.chosenSubCatsOne].length;
      }
      return this.msgService.broadcast("stats:Data", {
        popl: this.populations,
        total: this.samplesize,
        target: this.chosenSubCatsOne,
      });
    }

    /**
     * Collection of sliders that update sliders
     * @returns     
     */
    slider() {
      return $("#alphaUI").slider({
        min: 0.001,
        max: 0.2,
        value: this.alpha,
        orientation: "horizontal",
        range: "min",
        step: 0.001,
        slide: (event, ui) => {
          this.alpha = ui.value;
          this.msgService.broadcast("stats:alpha", this.alpha);
          return this.$scope.$apply();
        },
      });
    }
  }

  StatsSidebarCtrl.inject(
    "app_analysis_stats_dataService",
    "app_analysis_stats_msgService",
    "app_analysis_stats_algorithms",
    "$scope",
    "$timeout"
  );

  return StatsSidebarCtrl;
}.call(this);

module.exports = StatsSidebarCtrl;
