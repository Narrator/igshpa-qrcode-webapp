'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:usersCtrl
 * @description
 * # usersCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('UsersCtrl', function ($scope, $rootScope, $state, $stateParams, User, $log) {
    $scope.where = decodeStateParams($stateParams);
    //$scope.order = decodeStateParams($stateParams);
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
    
    $scope.subPage = null;
    $scope.selectAll = false;
    $scope.searchQuery = '';
    if($stateParams.stepsToday && $stateParams.stepsToday.length > 10 && $stateParams.stepsToday.charAt(11) === '['){
      var steps = $stateParams.stepsToday.substring(12,$stateParams.stepsToday.length-2);
      $scope.stepsToday.gte = parseInt(steps.substring(0,steps.indexOf(',')));
      $scope.stepsToday.lte = parseInt(steps.substring(steps.indexOf(',')+1));
    }
    if($stateParams.totalSteps && $stateParams.totalSteps.length > 10 && $stateParams.totalSteps.charAt(11) === '['){
      var steps = $stateParams.totalSteps.substring(12,$stateParams.totalSteps.length-2);
      $scope.totalSteps.gte = parseInt(steps.substring(0,steps.indexOf(',')));
      $scope.totalSteps.lte = parseInt(steps.substring(steps.indexOf(',')+1));
    }
    if($stateParams.averageSteps && $stateParams.averageSteps.length > 10 && $stateParams.averageSteps.charAt(11) === '['){
      var steps = $stateParams.averageSteps.substring(12,$stateParams.averageSteps.length-2);
      $scope.averageSteps.gte = parseInt(steps.substring(0,steps.indexOf(',')));
      $scope.averageSteps.lte = parseInt(steps.substring(steps.indexOf(',')+1));
    }
    if($scope.where.or) {
      var name = $scope.where.or[0].username.like;
      name = name.substring(0,name.length-2);
      $scope.searchQuery = name;
    }
    if ($scope.where.created && $scope.where.created.between) {
       $scope.where.created.gte=$scope.where.created.between[0];
       $scope.where.created.lte=$scope.where.created.between[1];
    }
    else {
      $scope.where.created = $scope.where.created;
    }
    if($scope.where.currentDevice) {
      $scope.where.currentDevice = $scope.where.currentDevice
    }
    $scope.avgStepsList=[];
    $scope.averageStepsSort = $stateParams.averageStepsSort || undefined;
    $scope.lastSeenSort = $stateParams.lastSeenSort || undefined;
    $scope.selection = $stateParams.selection || [];
    $scope.deSelect = $stateParams.deSelect || [];
    $scope.order = $stateParams.order || [];
    $scope.page = parseInt($stateParams.page || 1);
    $scope.pageSize = 10;
    $scope.totalItems = $scope.pageSize * $scope.page;
    $scope.where['_fitness.stepsToday'] = $scope.stepsToday;
    $scope.where['_fitness.totalSteps'] = $scope.totalSteps;
    $scope.where['_fitness.averageSteps'] = $scope.averageSteps;
    var filter = paramsToFilter($scope.where);
    filter.order = $scope.order;
    $scope.where.created = $scope.where.created || {};
    $scope.searchQueryBuilder = function () {
      $scope.where = {
        or: [
          {username: {like: $scope.searchQuery + '.*', options: 'i'}},
          {email: {like: $scope.searchQuery + '.*', options: 'i'}},
          {fullName: {like: $scope.searchQuery + '.*', options: 'i'}}
        ]
      };
    };
    $log.debug('User.count:',
      JSON.stringify({where: filter.where}));
    var countResult = User.count({where: filter.where},
      function onSuccess() {
        if ($scope.totalItems > (countResult.count + $scope.pageSize)) {
          $scope.totalItems = countResult.count;
        }
        else {
          $scope.totalItems = countResult.count;
          $scope.users =
            User.find({filter: filter}, function onSuccess() {
              $log.debug('User.find Success');
            }, function onError() {
              $log.error('User.find Error');
            });
           $scope.allUsersDow=
           User.find({filter: {where:filter.where,limit:$scope.totalItems,include:"joinedMovements"}}, function onSuccess() {
              $log.debug('User.find Success');
              var userLength=$scope.allUsersDow.length;
              $scope.dataDow=[];
              for(var i=0 ;i<userLength;i++){
                var createdDate=(new Date($scope.allUsersDow[i].created)).toDateString();
                var lastSeen = 0;
                if($scope.allUsersDow[i].lastAppOpened) {
                  lastSeen=(new Date($scope.allUsersDow[i].lastAppOpened)).toDateString();
                }
                var count=0;
                var allMovements=[];
                for(var j=0;j<$scope.allUsersDow[i].joinedMovements.length;j++){
                  if($scope.allUsersDow[i].joinedMovements[j].status=="active" || $scope.allUsersDow[i].joinedMovements[j].status=="pending"){
                    count++;
                    allMovements.push($scope.allUsersDow[i].joinedMovements[j].title);
                  }
                }
                if($scope.allUsersDow[i]._fitness){
                  $scope.dataDow.push({fullName:$scope.allUsersDow[i].fullName,
                    created:createdDate,
                    device:$scope.allUsersDow[i].currentDevice,
                    totalSteps:$scope.allUsersDow[i]._fitness.totalSteps,
                    stepsToday:$scope.allUsersDow[i]._fitness.stepsToday,
                    averageSteps:$scope.allUsersDow[i]._fitness.averageSteps,
                    lastSeen:lastSeen,
                    todayGoal:$scope.allUsersDow[i].goal,
                    workEmail:$scope.allUsersDow[i].domainEmail,
                    signUpEmail:$scope.allUsersDow[i].email,
                    memberships:count,
                    movements:allMovements
                    })
                  }
                else{
                  $scope.dataDow.push({fullName:$scope.allUsersDow[i].fullName,
                    created:createdDate,
                    device:$scope.allUsersDow[i].currentDevice,
                    totalSteps:'0',
                    stepsToday:'0',
                    averageSteps:'0',
                    lastSeen:lastSeen,
                    todayGoal:$scope.allUsersDow[i].goal,
                    workEmail:$scope.allUsersDow[i].domainEmail,
                    signUpEmail:$scope.allUsersDow[i].email,
                    memberships:$scope.allUsersDow[i].joinedMovements.length
                  })
                }

              }
            }, function onError() {
              $log.error('User.find Error');
            });
        }
      }, function onError() {
        $log.error('Error');
      });

      $scope.allUsers = User.find(
      {
        filter:
          {
            where: filter.where,
            limit: 6000000000,
            fields: {
              id: true
            }
          }
      }, function onSuccess() {
        $log.debug('User.find Success');
      }, function onError() {
        $log.error('User.find Error');
      });

    $scope.sortChange = function () {
      $scope.order = [];
      if (typeof $scope.averageStepsSort === "string" && $scope.averageStepsSort !== "undefined") {
        $scope.order.push($scope.averageStepsSort);
      }
      if (typeof $scope.lastSeenSort === "string" && $scope.lastSeenSort !== "undefined") {
        $scope.order.push($scope.lastSeenSort);
      }
    }

    $scope.formatDate = function (date) {
      return date.toUTCString();
    };

    $scope.search = function () {
      var stateParams = encodeStateParams($scope.where);
      $state.go('.', stateParams);
    };
    $scope.reset = function () {
      for (var key in $scope.where) {
        $scope.where[key] = undefined;
      }
      $scope.selection = [];
      $scope.deSelect = [];
      $scope.stepsToday = undefined;
      $scope.totalSteps = undefined;
      $scope.averageSteps = undefined;
      $scope.averageStepsSort = undefined;
      $scope.lastSeenSort = undefined;
      $scope.order = [];
      $scope.page = 1;
      $scope.search();
    };
    if (jQuery().datepicker) {
      $('.date-picker').datepicker({
        rtl: Metronic.isRTL(),
        autoclose: true
      });
    }
    else {
      $log.error('datepicker not present');
    }

    $scope.open = function ($event, selector) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = $scope.opened || {};
      $scope.opened[selector] = true;
    };

    function encodeRangeFilters(params) {
      var rangeFilter = angular.copy(params);
      if (rangeFilter) {
        if (rangeFilter.gte || rangeFilter.lte) {
          if(rangeFilter.gte !== undefined && rangeFilter.lte !== undefined) {
            rangeFilter.between = [rangeFilter.gte,rangeFilter.lte];
            if (!rangeFilter.gte) {
              delete rangeFilter.between;
              delete rangeFilter.gte;
            } else if (!rangeFilter.lte) {
              delete rangeFilter.between;
              delete rangeFilter.lte;
            } else {
              delete rangeFilter.gte;
              delete rangeFilter.lte;
            }
          }
        }
        if (rangeFilter.between) {
          if (rangeFilter.lte || rangeFilter.gte) {
            delete rangeFilter.between;
          }
          if (rangeFilter.gte === 0) {
            delete rangeFilter.between;
          }
          if (rangeFilter.lte === 0) {
            delete rangeFilter.between;
          }
        }
        if (rangeFilter.gte === null) {
          delete rangeFilter.gte;
        }
        if (rangeFilter.lte === null) {
          delete rangeFilter.lte;
        }
        if (rangeFilter.gte === 0 && rangeFilter.lte === 0) {
          rangeFilter.between = [rangeFilter.gte, rangeFilter.lte];
          delete rangeFilter.gte;
          delete rangeFilter.lte;
        }

        var str = JSON.stringify(rangeFilter);
        rangeFilter =  str;
        return rangeFilter;
      } else {
        return undefined;
      }
    }

    function encodeStateParams(params) {
      var stateParams = angular.copy(params);
      for (var key in stateParams) {
        var prop = stateParams[key];
        if (key === 'created') {
          stateParams[key] = encodeRangeFilters(prop);
          if ($.isEmptyObject(prop)) {
            stateParams[key] = undefined;
          }
          continue;
        }
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
        var str = JSON.stringify(prop);
        stateParams[key] = str;
      }
      stateParams.page = $scope.page;
      stateParams.selection = $scope.selection;
      stateParams.deSelect = $scope.deSelect;
      stateParams.stepsToday = encodeRangeFilters($scope.stepsToday);
      stateParams.totalSteps = encodeRangeFilters($scope.totalSteps);
      stateParams.averageSteps = encodeRangeFilters($scope.averageSteps);
      stateParams.order = $scope.order;
      stateParams.averageStepsSort = $scope.averageStepsSort;
      stateParams.lastSeenSort = $scope.lastSeenSort;
      return stateParams;
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
          //DO nothing
        }
      }
      delete params.page;
      delete params.selection;
      delete params.stepsToday;
      delete params.totalSteps;
      delete params.order;
      delete params.averageSteps;
      return params;
    }

    function paramsToFilter(params) {
      var where = angular.copy(params);
      var skip = $scope.pageSize * ($scope.page - 1);
      return {
        where: where,
        includeRoles: true,
        skip: skip,
        limit: $scope.pageSize
      };
    }

    $scope.pageChanged = function (value) {
      $scope.search();
    };

    $scope.toggleSelection = function (userId) {
      var idx = $scope.selection.indexOf(userId);
      var idy = $scope.deSelect.indexOf(userId);
      // is currently selected
      if ($scope.selectAll) {
        if(idy > -1) {
          $scope.deSelect.splice(idy, 1);
        } else {
          $scope.deSelect.push(userId);
        }
      }
      if (idx > -1) {
        $scope.selection.splice(idx, 1);

      }
      // is newly selected
      else {
       $scope.selection.push(userId);
      }
    };

    $scope.toggleSelectionAll = function () {
      if ($scope.selection.length === $scope.allUsers.length) {
        $scope.selection = [];
        $scope.selectAll = false;
        $scope.deSelect = [];
      } else {
        $scope.selection = [];
        $scope.deSelect = [];
        $scope.allUsers.forEach(function (user) {
          $scope.selection.push(user.id);
        });
        $scope.selectAll = true;
      }
    };

    $scope.mascotFeedsToSelected = function () {
      var stateParams = {};
      if ($scope.selection.length === $scope.allUsers.length) {
        if($scope.deSelect.length > 0) {
          $scope.where.nin = $scope.deSelect;
          delete stateParams.deSelect;
        }
        stateParams = encodeStateParams($scope.where);
        delete stateParams.selection;
      } else {
        stateParams.selection = $scope.selection;
      }
      $state.go('users.mascotFeedsToSelected', stateParams);
    };

    $scope.emailToSelected = function () {
      var stateParams = {};
      if ($scope.selection.length === $scope.allUsers.length) {
        stateParams = encodeStateParams($scope.where);
        delete stateParams.selection;
      } else {
        stateParams.selection = $scope.selection;
      }
      $state.go('users.emailToSelected', stateParams);
    };
  });
