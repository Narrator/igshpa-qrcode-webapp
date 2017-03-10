'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('LoginCtrl', function ($scope, Member, $location) {
    var next = $location.search()['next'] || '/';
    $scope.credentials = {};
    $scope.login = function ($event) {
      $event.preventDefault();
      var response = Member.login($scope.credentials, function onSuccess() {
        window.location.href = next;
      }, function onError(res) {
        if (!res.data) {
          $scope.error =
            'Login failed. Server unreachable';
        }
        $scope.error = res.data.error.message;
      });
    }
  });
