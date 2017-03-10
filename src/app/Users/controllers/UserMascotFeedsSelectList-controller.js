'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:UserMascotFeedsSelectListCtrl
 * @description
 * # UserMascotFeedsSelectListCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('UserMascotFeedsSelectListCtrl',
  function ($scope, $state, $stateParams, dialogs, MascotFeed, User, $log) {
    $scope.domainAdmin = User.getCachedCurrent();
    $scope.where = decodeStateParams($stateParams);
    $scope.subPage = null;
    $scope.page = parseInt($stateParams.page || 1);
    $scope.pageSize = 10;
    $scope.totalItems = $scope.pageSize * $scope.page;
    $scope.where.owner = $scope.domainAdmin.id;

    var filter = paramsToFilter($scope.where);
    filter.where = {
      selectFilter: {
        exists: true
      },
      owner: $scope.domainAdmin.id
    };
    $log.debug('MascotFeed.count:',
      JSON.stringify({where: filter.where}));
    var countResult = MascotFeed.count({where: filter.where},
      function onSuccess() {
        if ($scope.totalItems > (countResult.count + $scope.pageSize)) {
          $scope.totalItems = countResult.count;
        }
        else {
          $scope.totalItems = countResult.count;
          $scope.mascotFeeds =
            MascotFeed.find({filter: filter}, function onSuccess() {
              $log.debug('MascotFeed.find Success');
            }, function onError() {
              $log.error('MascotFeed.find Error');
            });
        }
      }, function onError() {
        $log.error('Error');
      });

    $scope.search = function () {
      var stateParams = encodeStateParams($scope.where);
      $state.go('.', stateParams);
    };

    function encodeStateParams(params) {
      var stateParams = angular.copy(params);
      for (var key in stateParams) {
        var prop = stateParams[key];
        //no need to encode if it's a string
        if (typeof prop === 'string') {
          continue;
        }
        //if it's an object, remove empty properties
        if (typeof prop === 'object') {
          //loop and remove empty properties
          for (var k in prop) {
            var p = prop[k];
            if (p === undefined) {
              delete prop[k];
            }
          }
        }
        //set keys with empty objects as undefined
        if ($.isEmptyObject(prop)) {
          stateParams[key] = undefined;
          continue;
        }
        else {
          $log.debug('else:', key, prop);
        }
        var str = JSON.stringify(prop);
        stateParams[key] = str;
      }
      stateParams.page = $scope.page;
      return stateParams
    }

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
          //Do nothing
        }
      }
      delete params.page;
      return params;
    }

    function paramsToFilter(params) {
      var where = angular.copy(params);
      var skip = $scope.pageSize * ($scope.page - 1);
      return {
        where: where,
        skip: skip,
        limit: $scope.pageSize
      };
    }

    $scope.pageChanged = function (value) {
      $scope.search();
    };
  });
