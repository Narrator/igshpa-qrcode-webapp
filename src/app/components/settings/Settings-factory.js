'use strict';
/**
 * @ngdoc service
 * @name VettiverFaxApp.settings
 * @description
 * # settings
 * Factory in the VettiverFaxApp.
 */
angular.module('VettiverFaxApp')
  .factory('SettingsFactory', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
      layout: {
        pageSidebarClosed: false, // sidebar menu state
        pageBodySolid: false, // solid body color state
        pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
      },
      layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
      layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
  }]);
