'use strict';
let BaseDirective = require('scripts/BaseClasses/BaseDirective');

/*
 * @name GetDataDragNDropDir
 * @desc Directive for drag-n-drop files into the handsontable
 * Inspired by http://buildinternet.com/2013/08/drag-and-drop-file-upload-with-angularjs/
 */
module.exports = class GetDataDragNDropDir extends BaseDirective {
  initialize() {
    this.restrict = 'A';
    // The link method does the work of setting the directive
    //  up, things like bindings, jquery calls, etc are done in here
    return this.link = (scope, element, attrs) => {
      var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;
      // function to prevent default behavior (browser loading image)
      processDragOverOrEnter = function(event) {
        if (event != null) {
          event.preventDefault();
        }
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'copy';
        } else if (event.originalEvent.dataTransfer) {
          event.originalEvent.dataTransfer.effectAllowed = 'copy';
        }
        return false;
      };
      validMimeTypes = attrs.getdatadragndrop;
      // if the max file size is provided and the size of dropped file is greater than it,
      // it's an invalid file and false is returned
      checkSize = function(size) {
        var ref;
        if (((ref = attrs.maxFileSize) === (void 0) || ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
          return true;
        } else {
          alert(`File must be smaller than ${attrs.maxFileSize} MB`);
          return false;
        }
      };
      isTypeValid = function(type) {
        if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
          return true;
        } else {
          // return true if no mime types are provided
          alert(`Invalid file type.  File must be one of following types ${validMimeTypes}`);
          return false;
        }
      };
      // for dragover and dragenter (IE) we stop the browser from handling the
      // event and specify copy as the allowable effect
      element.bind('dragover', processDragOverOrEnter);
      element.bind('dragenter', processDragOverOrEnter);
      // on drop events we stop browser and read the dropped file via the FileReader
      // the resulting droped file is bound to the image property of the scope of this directive
      return element.bind('drop', function(event) {
        var file, name, reader, size, type;
        if (event != null) {
          event.preventDefault();
        }
        reader = new FileReader();
        reader.onload = function(evt) {
          if (checkSize(size) && isTypeValid(type)) {
            return scope.$apply(function() {
              scope.mainArea.file = evt.target.result;
              if (angular.isString(scope.mainArea.fileName)) {
                return scope.mainArea.fileName = name;
              }
            });
          }
        };
        file = event.dataTransfer ? event.dataTransfer.files[0] : event.originalEvent.dataTransfer.files[0];
        name = file.name;
        type = file.type;
        size = file.size;
        reader.readAsText(file, 'UTF-8');
        return false;
      });
    };
  }

};
