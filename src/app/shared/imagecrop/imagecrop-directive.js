'use strict';
/**
 * @ngdoc directive
 * @name VettiverFaxApp.directive:imagecrop
 * @description
 * # imagecrop
 */
angular.module('VettiverFaxApp')
  .directive('imagecrop', function () {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        function deselectCrop() {
          scope.cropped.value = false;
          var canvas = angular.element('#imageCanvas')[0];
          var ctx = canvas.getContext('2d');
          ctx.fillStyle='white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        function updatePreview(c) {
          if(scope.cInst.scaleRatio) {
            if(parseInt(c.w) > 0) {
              // Show image preview
              scope.cInst.width = c.w / scope.cInst.scaleRatio;
              scope.cInst.height = c.h / scope.cInst.scaleRatio;
              scope.cropped.value = true;
              scope.$apply(function () {
                var imageObj = angular.element(elem)[0];
                var canvas = angular.element('#imageCanvas')[0];
                var context = canvas.getContext('2d');
                context.drawImage(imageObj, c.x, c.y, c.w, c.h, 0, 0, canvas.width, canvas.height);
              });
            }
          }
        }
        elem.on('load', function () {
          var self = this;
          if(scope.jcropHandler.value != '') {
            deselectCrop();
            scope.jcropHandler.value.destroy();
            scope.cropped.value = false;
            angular.element(self).removeAttr('style');
          }
          var imageWidth = scope.uploadImage.width,
          imageHeight = scope.uploadImage.height,
          scaledImageWidth = parseInt(angular.element(self).css('width').split('px')[0]),
          scaledImageHeight = parseInt(angular.element(self).css('height').split('px')[0]),
          aspectRatio = scope.cropSettings.aspectRatio,
          minSize = scope.cropSettings.minSize,
          maxSize = scope.cropSettings.maxSize,
          scaleRatio = imageWidth / scaledImageWidth,
          minWidth = minSize[0] * scaleRatio,
          minHeight = minSize[1] * scaleRatio,
          maxWidth = maxSize[0] * scaleRatio,
          maxHeight = maxSize[1] * scaleRatio;
          scope.cInst.scaleRatio = scaleRatio;

          if(scaledImageWidth < minSize[0] && scaledImageHeight < minSize[1]) {
            minWidth = maxWidth = scaledImageWidth * scaleRatio;
            minHeight = maxHeight = scaledImageHeight * scaleRatio;
          } 
          else if(scaledImageWidth < minSize[0]) {
            minWidth = maxWidth = scaledImageWidth * scaleRatio;
            minHeight = maxHeight = minWidth / aspectRatio;
          }  
          else if(scaledImageHeight < minSize[1]) {
            minHeight = maxHeight = scaledImageHeight * scaleRatio;
            minWidth = maxWidth = minHeight * aspectRatio;
          }         

          angular.element(self).Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            onRelease: deselectCrop,
            trueSize: [imageWidth, imageHeight],
            minSize: [minWidth,minHeight],
            maxSize: [maxWidth,maxHeight],
            aspectRatio: aspectRatio
          }, function () {
            scope.jcropHandler.value = this;
          });
        });
      }
    };
  });
