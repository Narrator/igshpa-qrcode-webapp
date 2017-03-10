'use strict';

describe('Filter: components', function () {
// load the filter's module
  beforeEach(module('VettiverFaxApp'));
// initialize a new instance of the filter before each test
  var components;
  beforeEach(inject(function ($filter) {
    components = $filter('components');
  }));
  it('should return the input prefixed with "components filter:"', function () {
    var text = 'angularjs';
    expect(components(text)).toBe('components filter: ' + text);
  });
});
