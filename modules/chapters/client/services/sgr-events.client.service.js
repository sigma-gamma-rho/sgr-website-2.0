'use strict';

//SgrEvents service used for communicating with the SgrEvents REST endpoints
angular.module('chapters').factory('SgrEvents', ['$resource',
  function ($resource) {
    return $resource('api/sgrEvents/:sgrEventId', {
      sgrEventId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
