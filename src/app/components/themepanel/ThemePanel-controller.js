'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:themepanelCtrl
 * @description
 * # themepanelCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('ThemePanelCtrl', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
      Demo.init(); // init theme panel
    });
  }]);
