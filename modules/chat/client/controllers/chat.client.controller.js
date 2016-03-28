'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket',
  function ($scope, $location, Authentication, Socket) {
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

    Socket.on('load:old:messages', function (docs) {
      for (var i = docs.length - 1; i >= 0; i--) {
        console.log(docs[i].msg);
        $scope.messages.push({
          username: docs[i].name,
          text: docs[i].msg,
          created: docs[i].created,
          profileImageURL: docs[i].img
        });
        //message.username : docs[i].name;
        //message.text : docs[i].msg;
        //message.created : docs[i].created;


        // $scope.messages.push({
        //   user: docs[i].name,
        //   text: docs[i].msg
        // });
      }
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
