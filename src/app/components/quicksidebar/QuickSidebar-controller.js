'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:QuickSidebarCtrl
 * @description
 * # QuickSidebarCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('QuickSidebarCtrl', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
      setTimeout(function(){
        QuickSidebar.init(); // init quick sidebar
      }, 2000)
    });
  }]);
