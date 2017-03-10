'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('HeaderCtrl', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
      Layout.initHeader(); // init header
    });
  }]);
