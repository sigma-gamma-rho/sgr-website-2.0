'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$state', 'Notifications', 'Authentication',
  function ($scope, $filter, Admin, $state, Notifications, Authentication) {

    $scope.authentication = Authentication;
    $scope.users = [];

    Admin.query(function (data) {
      $scope.filterUsers(data);
      //$scope.users = data;
      $scope.buildPager();
    });

    $scope.filterUsers = function (data) {

      // Remove the superadmin, if present
      for (var i = 0; i < data.length; i++) {
        if ($scope.isSuperAdmin(data[i].roles)){
          //console.log('Removing the superadmin from data');
          data.splice(i, 1);
        }
      }

      // if the user is a super admin, show all users from all chapters
      if ($scope.isSuperAdmin($scope.authentication.user.roles)){
        //console.log('You are a superadmin. Showing all users.');
        $scope.users = data;
      } else {
        // only list guests from the admins chapter
        //console.log('Only loading guests from the admins chapter, ' + $scope.authentication.user.affiliation);
        for (i = 0; i < data.length; i ++){
          if (data[i].affiliation === $scope.authentication.user.affiliation) {
            $scope.users.push(data[i]);
          } else {
            //console.log('Did not load ' + data[i].username + ' because they are affiliated with ' + data[i].affiliation);
          }
        }
      }
    };

    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    $scope.isAdmin = function(roles) {
      return roles.indexOf('admin') !== -1;
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

    $scope.info = function (userId) {
      $state.go('admin.user', { userId: userId });
    };

    // *********************
    // Modal Stuff
    // Promote the user to an admin
    $scope.setModalInformation = function (title, body, user, method){
      $scope.modalHeader = title;
      $scope.modalBody = body;
      $scope.user = user;
      $scope.modalMethod = method;
    };

    $scope.promote = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {
        // change the guests role to user
        $scope.entry.roles = ['admin'];

        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function() {
          $scope.users.splice($scope.users.indexOf($scope.user), 1);
          $scope.buildPager();
          Notifications.update();
        });
      });
    };

    $scope.demote = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {

        // change the guests role to user
        $scope.entry.roles = ['guest'];

        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function() {
          $scope.users.splice($scope.users.indexOf($scope.user), 1);
          $scope.buildPager();
          Notifications.update();
        });
      });
    };
  }
]);
