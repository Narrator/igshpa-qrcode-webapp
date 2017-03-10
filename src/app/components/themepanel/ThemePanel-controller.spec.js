'use strict';
describe('Controller: ThemePanelCtrl', function () {
// load the controller's module
  beforeEach(module('VettiverFaxApp'));
  var ThemePanelCtrl,
      scope;
// Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ThemePanelCtrl = $controller('ThemePanelCtrl', {
      $scope: scope
    });
  }));
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
