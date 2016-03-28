//Rssfeeds service used to communicate Rssfeeds REST endpoints
(function () {
  'use strict';

  angular
    .module('rssfeeds')
    .factory('RssfeedsService', RssfeedsService);

  RssfeedsService.$inject = ['$resource'];

  function RssfeedsService($resource) {
    return $resource('api/rssfeeds/:rssfeedId', {
      rssfeedId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();
