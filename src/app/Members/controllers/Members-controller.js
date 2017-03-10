'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:MembersCtrl
 * @description
 * # MembersCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('MembersCtrl',
  function ($scope, $state, $stateParams, Member, $log) {
    $scope.where = decodeStateParams($stateParams);
    $scope.subPage = null;
    /*if ($scope.where.status === 'pending') {
      $scope.subPage = 'Pending Members';
    }*/
    $scope.page = parseInt($stateParams.page || 1);
    $scope.pageSize = 10;
    $scope.totalItems = $scope.pageSize * $scope.page;

    var filter = paramsToFilter($scope.where);
    if (filter.where && filter.where.firstName && filter.where.firstName.like) {
      var like = filter.where.firstName.like;
      filter.where.firstName = {
        like: like + '.*',
        options: 'i'
      };
    }

    $log.debug('Member.count:',
      JSON.stringify({where: filter.where}));
    var countResult = Member.count({where: filter.where},
      function onSuccess() {
        if ($scope.totalItems > (countResult.count + $scope.pageSize)) {
          $scope.totalItems = countResult.count;
        }
        else {
          $scope.totalItems = countResult.count;
          filter.order = 'created DESC';
          $scope.members =
            Member.find({filter: filter}, function onSuccess() {
              $log.debug('Member.find Success');
            }, function onError() {
              $log.error('Member.find Error');
            });
        }
      }, function onError() {
        $log.error('Error');
      });

    $scope.search = function () {
      var stateParams = encodeStateParams($scope.where);
     // console.log($state.go('.', stateParams));
      //console.log($state.go('.', stateParams));
      $state.go($state.current, stateParams, {reload: true});
    };
    $scope.reset = function () {
      for (var key in $scope.where) {
        $scope.where[key] = undefined;
      }
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
      /*if (stateParams.trending === 'false') {
        stateParams.trending = false;
      }
      if (stateParams.trending === 'true') {
        stateParams.trending = true;
      }*/
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
      /*if (params.trending === false) {
        params.trending = 'false';
      }
      if (params.trending === true) {
        params.trending = 'true';
      }*/
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

    $scope.getDisplayName = function (user) {
      if (!user) {
        return 'undefined';
      }
      if (user.fullName) {
        return user.fullName;
      }
      var dispName = '';
      if (user.firstName) {
        dispName += user.firstName;
      }
      if (user.lastName) {
        if (user.firstName) {
          dispName += ' ';
        }
        dispName += user.lastName;
      }
      if (dispName !== '') {
        return dispName;
      }
      dispName = user.username;
      return dispName;
    };
    $scope.pageChanged = function (value) {
      console.log('page pageChanged',value);
      $scope.search();
    };
    toastr.options.closeButton = true;
    /*$scope.approve = function (member) {
      Member.prototype$patchAttributes({
        id: member.id
      }, {
        status: 'active'
      }, function onSuccess(updatedMember) {
        member.status = updatedMember.status;
        toastr.success('Member has been Approved!',
          'Member Approved');
      }, function onError() {
        $log.error('error approving member');
      })
    };
    $scope.rejected = function (member) {
      console.log(member);
      Member.prototype$patchAttributes({
        id: member.id
      }, {
        status: 'rejected'
      }, function onSuccess(updatedMember) {
        member.status = updatedMember.status;
        console.log(member.status);
      }, function onError() {
        $log.error('error in rejecting member');
      })
    };*/
  });
