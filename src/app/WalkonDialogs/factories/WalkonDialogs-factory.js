'use strict';
/**
 * @ngdoc service
 * @name VettiverFaxApp.walkondialogs
 * @description
 * # walkondialogs
 * Factory in the VettiverFaxApp.
 */
angular.module('VettiverFaxApp')
  .factory('walkondialogsFactory', function () {
// Service logic
// ...
    var meaningOfLife = 42;
// Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      }
    };
  });
