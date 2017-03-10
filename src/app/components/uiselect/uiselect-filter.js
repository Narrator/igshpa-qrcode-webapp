'use strict';
/**
 * @ngdoc filter
 * @name VettiverFaxApp.filter:components
 * @function
 * @description
 * # components
 * Filter in the VettiverFaxApp.
 */
angular.module('VettiverFaxApp')
  .filter('components', function () {
    return function (input) {
      return 'components filter: ' + input;
    };
  });
