'use strict';

angular.module('users.admin').controller('UserGuestController', ['$scope', '$filter', 'AdminGuests', '$state', 'Admin', 'Notifications', 'Authentication',
  function ($scope, $filter, AdminGuests, $state, Admin, Notifications, Authentication) {

    $scope.authentication = Authentication;
    $scope.users = [];

    AdminGuests.query(function (data) {
      $scope.filterUsers(data);
      $scope.buildPager();
    });

    $scope.filterUsers = function (data) {
      // if the user is a super admin, show all
      if ($scope.isSuperAdmin($scope.authentication.user.roles)){
        console.log('You are a superadmin. Showing all guests.');
        $scope.users = data;
      } else{
        // only list guests that have all their fields filled out
        console.log('Only loading guests from the admins chapter, ' + $scope.authentication.user.affiliation);
        for (var i = 0; i < data.length; i ++){
          if (data[i].firstName && data[i].lastName && data[i].email && data[i].affiliation && data[i].username){
            if (data[i].affiliation === $scope.authentication.user.affiliation) {
              $scope.users.push(data[i]);
            } else {
              console.log('Did not load ' + data[i].username + ' because they are affiliated with ' + data[i].affiliation);
            }
          } else{
            console.log('Did not load ' + data[i].username + ' because they are missing information.');
          }
        }
      }
    };

    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };

    $scope.info = function (user) {
      $state.go('admin.user', { 'userId': user._id });
    };

    // ------------------------------------------------------------------
    // Modal Stuff
    $scope.setModalInformation = function (title, body, user, method){
      $scope.modalHeader = title;
      $scope.modalBody = body;
      $scope.user = user;
      $scope.modalMethod = method;
    };

    $scope.approve = function (){
      if ($scope.user.firstName && $scope.user.lastName && $scope.user.affiliation && $scope.user.email && $scope.user.username){
        $scope.entry = Admin.get({ userId: $scope.user._id }, function() {

          // change the guests role to user
          $scope.entry.roles = ['user'];

          // update the guest, rebuild the page, update the # of notificaitons
          $scope.entry.$update(function() {
            $scope.users.splice($scope.users.indexOf($scope.user), 1);
            $scope.buildPager();
            Notifications.update();
          });
        });

      } else {
        alert('Guests missing information cannot be promoted. Try again when this user has filled out their profile completely.');
      }
    };

    $scope.deny = function (){
      Admin.remove({ userId : $scope.user._id }, function (data) {
        $scope.users.splice($scope.users.indexOf($scope.user), 1);
        $scope.buildPager();
        Notifications.update();
    });
  }
}
]);
