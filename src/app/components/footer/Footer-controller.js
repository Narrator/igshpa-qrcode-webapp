'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:FooterCtrl
 * @description
 * # FooterCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('FooterCtrl', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
      Layout.initFooter(); // init footer
    });
  }]);
