'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:UserMascotFeedsSelectCtrl
 * @description
 * # UserMascotFeedsSelectCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('UserMascotFeedsSelectCtrl',
  function ($scope, dialogs, User, $log, MascotFeed, mascotFeed, $stateParams, $state) {
    $scope.domainAdmin = User.getCachedCurrent();
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
    if (!mascotFeed.id) {
      mascotFeed = new MascotFeed();
      $scope.subPage = 'Create';
      $scope.isCreate = true;
    }
    if (mascotFeed.id) {
      $scope.isCreate = false;
      $scope.subPage = null;
      $scope.creator = User.findById({
        id: mascotFeed.owner
      }, function onSuccess () {
        $log.info('Resolve creator success');
      }, function onError() {
        $log.error('Resolve creator error');
      });
    }
    $scope.newMascot = {
      data: {}
    };

    if (mascotFeed.id && mascotFeed.selectFilter) {
      $scope.where = JSON.parse(mascotFeed.selectFilter.where);
    }

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

    $scope.mascotFeed = mascotFeed;
    $scope.userPageSize = 10;
    $scope.userPage = parseInt($stateParams.userPage || 1);
    $scope.totalUsers = $scope.userPageSize * $scope.userPage;

    $scope.mascotSubmitDisabled = function () {
      var m = $scope.newMascot.data;
      var fields = ['text', 'imageId'];
      var eitherFieldsSet = false;
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (m[field]) {
          eitherFieldsSet = true;
          break;
        }
      }
      return !(eitherFieldsSet);
    };

    $scope.createMascotFeed = function (mascot) {
      Metronic.blockUI({
        target: '#create-mascot-item',
        animate: true
      });
      var postData = {};
      if(mascot.heading){
        postData['heading'] = mascot.heading;
      } 
      for (var property in mascot.data) {
        if (!mascot.data.hasOwnProperty(property)) {
          continue;
        }
        if (['text', 'imageId', 'pushNotify','shareable'].indexOf(property) > -1) {
          postData[property] = mascot.data[property];
        }
      }
      var filter = {};
      filter.where = $scope.where;
      MascotFeed.customFeed({_filter: filter}, postData,
        function onSuccess(newMascot) {
          Metronic.unblockUI('#create-mascot-item');
          $state.go('users.mascotFeedsToSelectedDetails', {id: newMascot.id})
        }, function onError() {
          $log.error('error');
        });
    };

    $scope.addPictureToMascot = function (mascotFeed) {
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
    };

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
    $scope.pageChanged = function (value) {
      var filter = paramsToFilter($scope.where);
      $scope.users =
        User.find({filter: filter}, function onSuccess() {
          $log.debug('User.find Success');
        }, function onError() {
          $log.error('User.find Error');
        });
    };
  });
