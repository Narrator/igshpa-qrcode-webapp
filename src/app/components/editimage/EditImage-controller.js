'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:EditImageCtrl
 * @description
 * # editimageCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp').controller('EditImageCtrl',
  ['$rootScope','$scope', '$modalInstance', 'data', 'User', '$http', 'LoopBackAuth',
    'EnvironmentConfig','$log',
    function ($rootScope, $scope, $modalInstance, data, User, $http, LoopBackAuth,
              EnvironmentConfig, $log) {
      var modelInst = data;
      $scope.modelInst = modelInst;
      $scope.cropSettings = $rootScope.settings.imageCropSettings[data.type];
      console.log('cropsetting is',$scope.cropSettings);
      $scope.cInst = {
        width: $scope.cropSettings.minSize[0],
        height: $scope.cropSettings.minSize[1],
        scaleRatio: 0
      };
      $scope.cropped = { value : false };
      $scope.jcropHandler = { value : '' };
      $scope.myImage = '';
      $scope.croppedImage = '';
      $scope.uploadImage = '';
      $scope.showCroppedImage = true;
      $scope.loader=false;
      if (modelInst._picture) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', modelInst._picture.url, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
          var recoveredBlob = xhr.response;
          var reader = new FileReader;
          reader.onload = function(e) {
            $scope.uploadImage  = new Image();
            $scope.uploadImage.src = $scope.croppedImage = $scope.myImage = e.target.result;
            $scope.$apply();
          };
          reader.readAsDataURL(recoveredBlob);
        };
        xhr.send();    
      }

      /**
       * @desc Cancel the Edit Image Modal
       */
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      /**
       * @desc Use the cropped image as the image of the Movement/User
       */
      $scope.proceed = function () {
        //console.log("enter in to proceed");
        Metronic.blockUI({
          target: '#post-mascot-image',
          animate: true
        });
        if($scope.cropped.value) {
          $scope.croppedImage = angular.element("#imageCanvas")[0].toDataURL();
        }
        else {
          $scope.croppedImage = $scope.myImage;
        }
        console.log($scope.myImage);
        var dataURL = $scope.croppedImage;
        var blob = dataURLToBlob(dataURL);
        var formData = new FormData();
        formData.append('file', blob);
        $http.post(EnvironmentConfig.API_URL + '/users/me/images/upload',
          formData, {
            headers: {
              'Content-Type': undefined,
              authorization: LoopBackAuth.accessTokenId
            }
          }).success(onImageUploadSuccess).error(function onError() {
            $log.error('error');
            //TODO: handle error
          });
        function onImageUploadSuccess(data, status, headers, config) {
           Metronic.unblockUI('#post-mascot-image');
          $log.debug('image upload success');
          $modalInstance.close(data);
        }
      };
      /**
       *
       * @param dataURL
       * @returns {Blob}
       */
      function dataURLToBlob(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
          var parts = dataURL.split(',');
          var contentType = parts[0].split(':')[1];
          var raw = decodeURIComponent(parts[1]);

          return new Blob([raw], {type: contentType});
        }

        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
      }
    }
  ]).
  
  directive('imageUpload', ['dialogs', function (dialogs) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var reader = new FileReader();
        reader.onload = function (e) {
          console.log('content of e is',e);
            scope.uploadImage  = new Image();
            scope.uploadImage.src = scope.myImage = e.target.result;
            console.log(e.target.result);
            scope.$apply();
        };

        elem.on('change', function(err) {
            if(elem[0].files[0].type.split('/')[0] != 'image') {
              dialogs.notify('Invalid Image', 'Please choose valid image');
              angular.element(elem).val('');
              scope.myImage = '';
              scope.uploadImage = '';
              scope.$apply();
            }
            else reader.readAsDataURL(elem[0].files[0]);
        });
      }
    };
  }])
;
