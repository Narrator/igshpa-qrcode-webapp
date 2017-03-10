'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:UserEmailSelectCtrl
 * @description
 * # EmailSendSelectCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('UserEmailSelectCtrl',['$scope', 'MascotImage','dialogs', 'User', '$log', '$stateParams', '$state','$http', 'LoopBackAuth',
    'EnvironmentConfig', 'Upload',
  function ($scope, MascotImage, dialogs, User, $log, $stateParams, $state, $http, LoopBackAuth, EnvironmentConfig, Upload) {
    $scope.options = {
      height : 300
    };
    $scope.imageUpload = function (files) {
     uploadEditorImage(files);
    };

    function uploadEditorImage (files) {
      if (files != null) {
        Upload.upload({
            url: EnvironmentConfig.API_URL + '/users/me/images/upload',
            file: files[0],
            headers: {
              'Content-Type': undefined,
              authorization: LoopBackAuth.accessTokenId
            }
        }).success(function(data, status, headers, config) {
          var editor = $.summernote.eventHandler.getModule();
          var uploaded_file_name = data.filename; // this is the filename as stored on your server.
          editor.insertImage($scope.editable, data.url, uploaded_file_name);
        });
      }
    }
    $scope.domainAdmin = User.getCachedCurrent();
    var  mascotImage = new MascotImage();
    if ($stateParams.selection) {
      if (typeof $stateParams.selection === 'string') {
        $scope.where = {
          id: $stateParams.selection
        };
      } else {
        $scope.where = {
          id: {
            inq: $stateParams.selection
          }
        };
      }
    } else {
      $scope.where = decodeStateParams($stateParams);
    }
    if ($stateParams.stepsToday) {
      $scope.stepsToday = JSON.parse(decodeURIComponent($stateParams.stepsToday));
    } else {
      $scope.stepsToday = undefined;
    }
    if ($stateParams.totalSteps) {
      $scope.totalSteps = JSON.parse(decodeURIComponent($stateParams.totalSteps));
    } else {
      $scope.totalSteps = undefined;
    }
    if ($stateParams.averageSteps) {
      $scope.averageSteps = JSON.parse(decodeURIComponent($stateParams.averageSteps));
    } else {
      $scope.averageSteps = undefined;
    }
    $scope.where['_fitness.stepsToday'] = $scope.stepsToday;
    $scope.where['_fitness.totalSteps'] = $scope.totalSteps;
    $scope.where['_fitness.averageSteps'] = $scope.averageSteps;
    $scope.subPage = 'Create';
    $scope.isCreate = true;

    $scope.email = {};
    $scope.userFilter = paramsToFilter($scope.where);
    var filter = $scope.userFilter;
    filter.order = $scope.averageStepsOrder = angular.copy($stateParams.order);
    $log.debug('User.count:',
      JSON.stringify({where: filter.where}));
    var countResult = User.count({where: filter.where},
      function onSuccess() {
        if ($scope.totalUsers > (countResult.count + $scope.userPageSize)) {
          $scope.totalUsers = countResult.count;
        }
        else {
          $scope.totalUsers = countResult.count;
          $scope.users =
            User.find({filter: filter}, function onSuccess() {
              $log.debug('User.find Success');
            }, function onError() {
              $log.error('User.find Error');
            });
        }
      }, function onError() {
        $log.error('Error');
      });

    $scope.userPageSize = 10;
    $scope.userPage = parseInt($stateParams.userPage || 1);
    $scope.totalUsers = $scope.userPageSize * $scope.userPage;

    $scope.emailSubmitDisabled = function () {
      var eitherFieldsSet = true;
      if($scope.subject && $scope.from){
        eitherFieldsSet=false;
      }
      return eitherFieldsSet;
    };

    $scope.sendEmail = function (text) {
      Metronic.blockUI({
        target: '#blockUI',
        animate: true
      });
      var postData = {};
      postData.from = $scope.from;
      postData.subject = $scope.subject;
      postData.body = text;
      postData.fromName = $scope.fromName;
      var filter = {};
      filter.where = $scope.where;
      User.sendEmail({filter: filter}, postData,
        function onSuccess() {
          toastr.success('We redirect you on user page','Email Sent Successfully');
          Metronic.unblockUI('#blockUI');
          setTimeout(function(){
            $state.go('users.list');
          }, 2000);
        }, function onError() {
          $log.error('error');
        });
    };

    /*$scope.addPictureToMascot = function (mascotFeed) {
      mascotFeed.type = 'mascotFeed';
      var dlg = dialogs.create('app/tpl/edit-image-dialog.html',
        'EditImageCtrl',
        mascotFeed);
      dlg.result.then(function (value) {
        mascotFeed._picture = value;
        mascotFeed.data.imageId = value.id;
        //$scope.postImage = $scope.movement._picture.url;
        //TODO: We should probably save the data right away.As of now, data is not saved. User has to click
        //the save button to activate the new profile picture
      }, function (value) {
        //TODO: handle error
      });
    };*/

    function decodeStateParams($stateParams) {
      var params = angular.copy($stateParams) || {};
      for (var key in params) {
        var prop = params[key];
        if (typeof prop !== "string") {
          continue;
        }
        try {
          var obj = JSON.parse(decodeURIComponent(prop));
          params[key] = obj;
        }
        catch (e) {
          //DO nothing
        }
      }
      delete params.page;
      delete params.selection;
      delete params.stepsToday;
      delete params.totalSteps;
      delete params.averageSteps;
      delete params.order;
      return params;
    }
    function paramsToFilter(params) {
      var where = angular.copy(params);
      var skip = $scope.userPageSize * ($scope.userPage - 1);
      return {
        where: where,
        includeRoles: true,
        skip: skip,
        limit: $scope.userPageSize,
        order : $scope.averageStepsOrder
      };
    }
    $scope.clickToOpen = function () {
      $scope.mascotImage.type = "mascotImage";
      var dlg = dialogs.create('app/tpl/edit-image-dialog.html',
        'EditImageCtrl', $scope.mascotImage);
      dlg.result.then(function (value) {
        $scope.onImageUploadSuccess(value);

        //TODO: We should probably save the data right away.As of now, data is not saved. User has to click
        //the save button to activate the new profile picture
      }, function (value) {
        //TODO: handle error
      });
    };
    $scope.openTab = function (url) {
      var win = window.open(url, '_blank');
      win.focus();
    };
    $scope.pageChanged = function (value) {
      var filter = paramsToFilter($scope.where);
      $scope.users =
        User.find({filter: filter}, function onSuccess() {
          $log.debug('User.find Success');
        }, function onError() {
          $log.error('User.find Error');
        });
    };
    /*$scope.imageUpload = function (file) {
      var formData = new FormData();
      formData = file;
      console.log(formData.dataURL);
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
          
        }
    }*/
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
  }]);
