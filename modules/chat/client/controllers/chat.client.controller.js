'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket', '$http',
  function ($scope, $location, Authentication, Socket, $http) {
    // Create a messages array
    $scope.messages = [];

    // If user is not signed in then redirect back home
    if (!Authentication.user) {
      $location.path('/');
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect();
    }

    // Add an event listener to the 'chatMessage' event
    Socket.on('chatMessage', function (message) {
      $scope.messages.unshift(message);
    });

    /*
    Disabled due to issues with Angular changing the view
    Socket.on('load:old:messages', function (docs) {
      for (var i = docs.length - 1; i >= 0; i--) {
        // Adds messages to local angular Array for posting
        $scope.messages.push({
          username: docs[i].name,
          text: docs[i].msg,
          created: docs[i].created,
          profileImageURL: docs[i].img
        });
        $scope.didLoad = true;
        console.log('Loaded for the first time:' + $scope.didLoad);
        //message.username : docs[i].name;
        //message.text : docs[i].msg;
        //message.created : docs[i].created;
        // $scope.messages.push({
        //   user: docs[i].name,
        //   text: docs[i].msg
        // });
      }
    });*/

    // Get the chat documents on page load
    $http.get('api/chat/docs').success(function (response) {
      for (var i = 0; i < response.length ; i++){
        $scope.messages.push({
          username: response[i].name,
          text: response[i].msg,
          created: response[i].created,
          profileImageURL: response[i].img
        });
      }
      }).error(function (response) {
        //If error on chat fetch, what to do?
        // push an error message to $scope.messages
      });



    // Create a controller method for sending messages
    $scope.sendMessage = function () {
      // Create a new message object
      var message = {
        text: this.messageText
      };

      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);

      // Clear the message text
      this.messageText = '';
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('chatMessage');
    });
  }
]);
