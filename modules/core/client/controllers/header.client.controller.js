'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', 'AdminGuestsCount', 'Notifications',
  function ($scope, $state, Authentication, Menus, AdminGuestsCount, Notifications) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Watch the number of guest requests
    // These change as we approve / deny guests
    $scope.notifications = Notifications.count;
    $scope.$watch(
      function(){ return Notifications.count; },

      function(newVal) {
        $scope.notifications= newVal;
      }
    );

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Get the number of guests
    $scope.getCount = function(){
      AdminGuestsCount.get(function (data) {
        $scope.notifications = data.count;
      }, function(error){
        console.log(error);
      });
    };

    // Iterate through the menu items
    // If the admin item is a menu item
    // And we have permissions to see it
    // Get the number of guest requests
    for (var i = 0; i < $scope.menu.items.length; i ++){
      var obj = $scope.menu.items[i];
      for (var prop in obj){
        if (obj.hasOwnProperty(prop) && obj[prop] === 'Admin') {
          if (obj.shouldRender(Authentication.user)){
            $scope.getCount();
          }
        }
      }
    }

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
