'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', 'AdminGuestsCount', 'Notifications',
  function ($scope, $state, Authentication, Menus, AdminGuestsCount, Notifications) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Watch the number of guest requests
    // These change as we approve / deny guests
    Notifications.update();
    $scope.notifications = Notifications.count;
    $scope.$watch(
      function(){ return Notifications.count; },

      function(newVal) {
        $scope.notifications= newVal;
      }
    );

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);
