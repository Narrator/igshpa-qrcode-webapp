'use strict';
angular.module('VettiverFaxApp')
.directive('texteditor', function () {
 return {
   restrict: 'A',
   link: function(scope, element, attributes, controllers) {
   angular.element("#editor").wysiwyg();
   scope.$watch(attributes.ngModel, function(value) {
      angular.element(element).html(value);
    });
    element.bind('blur', function(){
      controller.$setViewValue(element.html());
        if (!scope.$$phase) {
          scope.$apply();
        }
    });
    console.log(element);
    element.on('load', function () {
      alert('loaded');
    });
   }
 };
});