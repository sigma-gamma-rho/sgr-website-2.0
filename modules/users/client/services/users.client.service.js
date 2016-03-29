'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('AdminGuests', ['$resource',
  function ($resource) {
    return $resource('api/guests/:guestId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('AdminGuestsCount', ['$resource',
  function ($resource) {
    return $resource('api/guestcount', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('AdminAdmins', ['$resource',
  function ($resource) {
    return $resource('api/admins/:adminId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
