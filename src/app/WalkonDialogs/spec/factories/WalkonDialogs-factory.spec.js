describe('Factory: walkondialogsFactory', function() {
  var walkondialogs;
  beforeEach(module('VettiverFaxApp'));
  beforeEach(inject(function(_walkondialogsFactory_) {
    walkondialogs = _walkondialogsFactory_;
  }));

  it('should provide the meaning of life', function() {
    expect(walkondialogs.someMethod() == 42).toBeTruthy();
  });

});
