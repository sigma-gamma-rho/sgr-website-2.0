'use strict';

angular.module('core.admin').run(['Menus', '$rootScope','$window', '$location', '$state',
  function (Menus, $rootScope, $window, $location, $state) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      // catch error
      $state.go('forbidden');
    });
  }
]);
