'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:dashboardCtrl
 * @description
 * # dashboardCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('DashboardCtrl',
  ['$rootScope', '$scope', '$http', '$timeout', '$injector', '$state', '$log',
    'Member',
    function ($rootScope, $scope, $http, $timeout, $injector, $state, $log,
              Member) {
      $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        Metronic.initAjax();
      });
      // success response

      $scope.domainAdmin = Member.getCachedCurrent();
      //var Campaign = $injector.get('Campaign', 'DashboardCtrl');
      //var Signature = $injector.get('Signature', 'DashboardCtrl');
      /*$scope.campaigns = Campaign.count({}, function () {
        $log.debug($scope.campaigns);
      }, function () {
        $log.error('error');
      });

      $scope.totalSignatures = Signature.count({}, function () {
        $log.debug($scope.totalSignatures);
      }, function () {
        $log.debug($scope.totalSignatures);
      })*/

      Member.count(function onSuccess(res){
        $scope.totalUsers=res.count;
      });

      $scope.allMembers = function () {
        $scope.members =
          Member.find({filter: {
            order: 'created DESC',
            limit: 50
          }
        }, function success(members) {
          console.log(members);
        }, function error(errors) {

        });
      };
      $scope.allMembers();
      $scope.handleUser = function (member) {
        var stateParams = {
          id: member.id
        };
        $state.go('members.details', stateParams);
      };
    }]);
