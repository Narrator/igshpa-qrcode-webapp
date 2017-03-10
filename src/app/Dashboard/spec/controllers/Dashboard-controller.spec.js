'use strict';
describe('Controller: dashboardCtrl', function () {
// load the controller's module
  beforeEach(module('VettiverFaxApp'));
  var dashboardCtrl,
      scope;
// Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    dashboardCtrl = $controller('dashboardCtrl', {
      $scope: scope
    });
  }));
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
