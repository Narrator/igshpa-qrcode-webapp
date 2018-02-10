'use strict';

(/**
 *
 * @param {Metronic} Metronic
 */
  function (Metronic) {
  var VettiverFaxApp = angular.module('VettiverFaxApp',
    ['VettiverFaxApp.config', 'ngTouch', 'ui.router', 'ui.bootstrap',
      'ui.bootstrap.tpls', 'ngSanitize', 'ngResource', 'lbServices',
      'dialogs.main', 'dialogs.default-translations', 'ImageCropper',
      'dcbImgFallback', 'angularMoment','ui.bootstrap','ui.bootstrap.datetimepicker',
      'toggle-switch','ngCsv','summernote','ngFileUpload']);

  /********************************************
   END: BREAKING CHANGE in AngularJS v1.3.x:
   *********************************************/

  /* Setup global settings */
  VettiverFaxApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages settings
    var settings = {
      layout: {
        pageSidebarClosed: false, // sidebar menu state
        pageBodySolid: false, // solid body color state
        pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
      },
      layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
      layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    }; // Image settings

    $rootScope.settings = settings;

    return settings;
  }]);


  /***
   Layout Partials.
   By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
   initialization can be disabled and Layout.init() should be called on page load complete as explained above.
   ***/

  VettiverFaxApp.config(function ($stateProvider, $urlRouterProvider,
                                dialogsProvider, LoopBackResourceProvider,
                                EnvironmentConfig) {
    dialogsProvider.useBackdrop('static');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .state('members', {
        url: '/members',
        abstract: true,
        template: '<div ui-view="" class="fade-in-up"></div>'
      })
      .state('members.list', {
        url: '/list?firstName&lastName&company&state&city&phone1&email&page',
        templateUrl: 'app/views/members.html',
        controller: 'MembersCtrl'
      })
      .state('members.create', {
        url: '/create',
        templateUrl: 'app/views/member_details.html',
        controller: 'MemberDetailsCtrl',
        resolve: {
          member: ['Member', '$log',
            function resolveMember(Member, $log) {
              //$scope.editMode = true;
              return new Member({});
            }]
        }
      })
      .state('members.details', {
        url: '/:id',
        templateUrl: 'app/views/member_details.html',
        controller: 'MemberDetailsCtrl',
        resolve: {
          member: ['Member', '$stateParams', '$log',
            function resolveMember(Member, $stateParams, $log) {
              return Member.findById({id: $stateParams.id},
                {/*include: 'initiator'*/},
                function onSuccess(member) {
                  $log.debug('resolveMember success');
                  //campaign.faxNumbers = campaign.faxNumbers.join(',');
                },
                function onError() {
                  $log.error('resolveMember error');
                }
              ).
                $promise;
            }]
        }
      })
      .state('members.details.edit', {
        url: '/edit',
        // template: '<div></div>',
        controller: function ($scope) {
          $scope.$parent.editMode = true;
        }
      });

    $urlRouterProvider.otherwise('/');
    LoopBackResourceProvider.setUrlBase(EnvironmentConfig.API_URL);

  });


  /* Init global settings and run the app */
  VettiverFaxApp.run(["$rootScope", "settings", "$state", 'LoopBackAuth', 'Member',
    '$stateParams', '$location', '$urlRouter', '$log',
    function ($rootScope, settings, $state, LoopBackAuth, Member, $stateParams,
              $location, $urlRouter, $log) {
      if ($location.absUrl().indexOf('/login.html') > -1) {
        $log.debug('login');
        return;
      }
      $rootScope.$state = $state; // state to be accessed from view
      $rootScope.$stateParams = $stateParams;
      // set sidebar closed and body solid layout mode
      $rootScope.settings.layout.pageBodySolid = true;
      $rootScope.settings.layout.pageSidebarClosed = false;
      if ($location.absUrl().indexOf('/public.html') > -1) {
        $log.debug('public');
        return;
      }
      if (LoopBackAuth.accessTokenId) {
        $rootScope.accessToken = LoopBackAuth.accessTokenId;
        $rootScope.$on('$stateChangeStart', function (event) {
          if ($rootScope.currentUser && $rootScope.currentUser.$resolved) {
            return;
          }
          // Halt state change from even starting
          event.preventDefault();
          $rootScope.currentUser = Member.getCurrent(function onSuccess() {
            $urlRouter.sync();
            $rootScope.$broadcast('adminUserLoaded', $rootScope.currentUser);
          }, function onError() {
            window.location.href =
              'http://139.78.55.193/igshpa-qrcode-webapp/dist/login.html#/?' + 'next=' + $location.absUrl();
          });
        });
      }
      else {
        window.location.href = 'http://139.78.55.193/igshpa-qrcode-webapp/dist/login.html#/?' + 'next=' + $location.absUrl();
      }

      /**
       *
       * @param user
       * @returns {*}
       */
      $rootScope.getDisplayName = function (user) {
        if (!user) {
          return 'undefined';
        }
        if (user.fullName) {
          return user.fullName;
        }
        var dispName = '';
        if (user.firstName) {
          dispName += user.firstName;
        }
        if (user.lastName) {
          if (user.firstName) {
            dispName += ' ';
          }
          dispName += user.lastName;
        }
        if (dispName !== '') {
          return dispName;
        }
        return user.username || user.email;
      };
      /**
       *
       * @param picture
       * @param size
       * @returns {*}
       */

      $rootScope.logout = function (event) {
        Member.logout(function onSuccess() {
          window.location.href =
            'http://139.78.55.193/igshpa-qrcode-webapp/dist/login.html#/?' + 'next=' + $location.absUrl();
        }, function (err) {
          $log.error('User logout error');
        });
      }
    }]);


})(window.Metronic);
