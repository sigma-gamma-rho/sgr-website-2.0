'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('chapters').factory('Chapters', ['$resource',
  function ($resource) {
    return $resource('api/chapters/:chapterId', {
      chapterId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
