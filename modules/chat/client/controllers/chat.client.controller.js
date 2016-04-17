'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket', '$http', 'FeedService',
  function ($scope, $location, Authentication, Socket, $http, Feed) {
    // Create a messages array
    $scope.messages = [];

    /* RSS Feed Links - Needs to go to DB schema */
    /*$scope.RSSfeeds = [
      { title:'Top Stories', content:'http://rss.cnn.com/rss/cnn_topstories.rss' },
      { title:'World', content:'http://rss.cnn.com/rss/cnn_world.rss' },
      { title:'US', content:'http://rss.cnn.com/rss/cnn_us.rss' },
      { title:'Business', content:'http://rss.cnn.com/rss/money_latest.rss' },
      { title:'Politics', content:'http://rss.cnn.com/rss/cnn_allpolitics.rss' },
      { title:'Technology', content:'http://rss.cnn.com/rss/cnn_tech.rss' },
      { title:'Health', content:'http://rss.cnn.com/rss/cnn_health.rss' },
      { title:'Entertainment', content:'http://rss.cnn.com/rss/cnn_showbiz.rss' },
      { title:'Travel', content:'http://rss.cnn.com/rss/cnn_travel.rss' },
      { title:'Living', content:'http://rss.cnn.com/rss/cnn_living.rss' },
    ];*/

    // initialize view
    $scope.init = function (){
      $http.get('api/content').success(function (response) {
        $scope.RSSfeeds = response[0].rss;
        $scope.loadFeed($scope.RSSfeeds[0].content, null, 'Select Feed');
      }).error(function (response) {
        // If error on chapter fetch, do not allow signup until resolved
        $location.path('/server-error');
      });
    };
    $scope.init();




    $scope.feedDefault='Select Feed';
    $scope.loadFeed=function(feed, e, custom){
      $scope.feedSrc = feed;
      Feed.parseFeed(feed).then(function(res){

        // In case they enter an invalid url
        if (res.data.responseStatus !== 200){
          $scope.feeds = [];
          $scope.error = 'Sorry, this link is not working';
          $scope.feedDefault='Select Feed';
        }

        // If they entered a valid url
        if (res.data.responseStatus === 200){
          if (e){
            $scope.feedDefault=angular.element(e.target).text();
          }
          if (custom){
            $scope.feedDefault = custom;
          } else{
            $scope.feedDefault=angular.element(e.target).text();
          }
          $scope.feeds=res.data.responseData.feed.entries;
          $scope.error = '';
        }
      });
    };




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

    // Get the old chat documents on page load
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
