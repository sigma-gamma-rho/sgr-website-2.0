(function () {
  'use strict';

  angular
    .module('rssfeeds')
    .controller('RssfeedsListController', RssfeedsListController);

  RssfeedsListController.$inject = ['RssfeedsService'];

  function RssfeedsListController(RssfeedsService) {
    var vm = this;

    vm.rssfeeds = RssfeedsService.query();
  }
})();
