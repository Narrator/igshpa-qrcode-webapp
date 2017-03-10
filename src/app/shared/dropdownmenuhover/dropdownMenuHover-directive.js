'use strict';
/**
 * @ngdoc directive
 * @name VettiverFaxsApp.directive:dropdownMenuHover
 * @description
 * # dropdownMenuHover
 */
angular.module('VettiverFaxApp')
  .directive('dropdownMenuHover', function () {
    return {
      link: function (scope, elem) {
        elem.dropdownHover();
      }
    };
  });
