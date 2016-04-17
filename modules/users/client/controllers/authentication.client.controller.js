'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'Menus', 'AdminGuestsCount', 'Notifications',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Menus, AdminGuestsCount, Notifications) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // On load, get the list of chapters for which to populate the dropdown
    $scope.data = { availableOptions: [] };
    $http.get('api/chapters').success(function (response) {
      // If no chapters exist, then do not allow signup until resolved
      if (!response.length){
        $location.path('/server-error');
      }
      // Populate the data array
      else {
        for (var i = 0; i < response.length; i ++){
          $scope.data.availableOptions.push(response[i].title);
        }
      }
    }).error(function (response) {
      // If error on chapter fetch, do not allow signup until resolved
      $location.path('/server-error');
    });

    $scope.sendMail = function(){

      // Send emails to superadmin, admin, and guest on signup
      var data = {
        firstName: $scope.credentials.firstName,
        lastName: $scope.credentials.lastName,
        affiliation: $scope.credentials.affiliation,
        email: $scope.credentials.email
      };

      $http.post('api/auth/sendEmails', data).then(function (res){
        //console.log(res);
      });

    };

    $scope.postUser = function(){
      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {

        // Only send email on successful posting of user
        $scope.sendMail();

        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);

      }).error(function (response) {
        $scope.error = response.message;
      });
    };



    $scope.signup = function (isValid) {
      $scope.error = null;

      // Check if the form is valid
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }
      // Post the user
      $scope.postUser();
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // Get the number of notifications if they are an admin
        Notifications.update();

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);


      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {


      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
