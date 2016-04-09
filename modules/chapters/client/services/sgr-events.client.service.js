(function () {
  'use strict';

  angular
    .module('chapters').factory('SgrEvents', EventsService);

  EventsService.$inject = ['$resource'];
  function EventsService($resource) {
    return $resource('api/sgrEvents/:sgrEventId', {
      sgrEventId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
