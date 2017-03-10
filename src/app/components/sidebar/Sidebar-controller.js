'use strict';
/**
 * @ngdoc function
 * @name VettiverFaxApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the VettiverFaxApp
 */
angular.module('VettiverFaxApp')
  .controller('SidebarCtrl', ['$scope', 'User',
  	function ($scope, User ) {
  		$scope.showMenu = false;
	    $scope.$on('$includeContentLoaded', function() {
	      Layout.initSidebar(); // init sidebar
	    });
		$scope.$on('adminUserLoaded', function(event, user) { 
			console.log(user);
			if (user.entryDomainName === 'global') {
				$scope.showMenu = true;
			}
		});
  	}]);
