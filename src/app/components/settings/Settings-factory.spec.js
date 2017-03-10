describe('Factory: SettingsFactory', function() {
  var settings;
  beforeEach(module('VettiverFaxApp'));
  beforeEach(inject(function(_SettingsFactory_) {
    settings = _SettingsFactory_;
  }));

  it('should provide the meaning of life', function() {
    expect(settings.someMethod() == 42).toBeTruthy();
  });

});
