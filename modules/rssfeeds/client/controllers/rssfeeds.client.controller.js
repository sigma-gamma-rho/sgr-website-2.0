(function () {
  'use strict';

  // Rssfeeds controller
  angular
    .module('rssfeeds')
    .controller('RssfeedsController', RssfeedsController);

  RssfeedsController.$inject = ['$scope', '$state', 'Authentication', 'rssfeedResolve'];

  function RssfeedsController ($scope, $state, Authentication, rssfeed) {
    var vm = this;

    vm.authentication = Authentication;
    vm.rssfeed = rssfeed;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Rssfeed
    function remove() {
      if (confirm('Are you sure you want to delete?')) {
        vm.rssfeed.$remove($state.go('rssfeeds.list'));
      }
    }

    // Save Rssfeed
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.rssfeedForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.rssfeed._id) {
        vm.rssfeed.$update(successCallback, errorCallback);
      } else {
        vm.rssfeed.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rssfeeds.view', {
          rssfeedId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
})();
