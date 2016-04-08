(function () {
  'use strict';

  angular
    .module('chapters').factory('Events', EventsService);

  EventsService.$inject = ['$resource'];
  function EventsService($resource) {
    return $resource('api/events/:eventId', {
      eventId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
