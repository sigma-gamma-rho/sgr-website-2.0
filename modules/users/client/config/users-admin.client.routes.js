'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.guests', {
        url: '/guests',
        templateUrl: 'modules/users/client/views/admin/list-guests.client.view.html',
        controller: 'UserGuestController'
      })
      .state('admin.admins', {
        url: '/admins',
        templateUrl: 'modules/users/client/views/admin/list-admins.client.view.html',
        controller: 'UserAdminController',
        resolve: {
          resolved: ['Authentication', '$q', '$window', function (Authentication, $q, $window) {
            var d = $q.defer();
            if (Authentication.user.roles.indexOf('superadmin') !== -1 ) {
              d.resolve(Authentication.user);
            } else {
              d.reject('Not a superadmin');
            }
            return d.promise;
          }]
        }
      })
      .state('admin.content', {
        url: '/content',
        templateUrl: 'modules/users/client/views/admin/content.client.view.html',
        controller: 'ContentController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);
