'use strict';
describe('Controller: movementsCtrl', function () {
// load the controller's module
  beforeEach(module('VettiverFaxApp'));
  var movementsCtrl,
      scope;
// Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    movementsCtrl = $controller('movementsCtrl', {
      $scope: scope
    });
  }));
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
