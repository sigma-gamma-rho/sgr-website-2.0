'use strict';

// Chapter controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Chapters', 'Events',
  function ($scope, $stateParams, $location, Authentication, Chapters, Events) {
    $scope.authentication = Authentication;

    // Create new Chapter
    $scope.createChapter = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'chapterForm');

        return false;
      }

      // Create new Chapter object
      var chapter = new Chapters({
        title: this.title,
        president: this.president, 
        presidentemail: this.presidentemail,
        vice: this.vice,
        viceemail: this.viceemail,
        location: this.location,
        content: this.content
      });

      // Redirect after save
      chapter.$save(function (response) {
        $location.path('chapters/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.president = '';
        $scope.presidentemail = '';
        $scope.vice = '';
        $scope.viceemail = '';
        $scope.location = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Chapter
    $scope.removeChapter = function (chapter) {
      if (chapter) {
        chapter.$remove();

        for (var i in $scope.chapters) {
          if ($scope.chapters[i] === chapter) {
            $scope.chapters.splice(i, 1);
          }
        }
      } else {
        $scope.chapter.$remove(function () {
          $location.path('chapters');
        });
      }
    };

    // Update existing Chapter
    $scope.updateChapter = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'chapterForm');

        return false;
      }

      var chapter = $scope.chapter;

      chapter.$update(function () {
        $location.path('chapters/' + chapter._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    
    // Find a list of Chapters
    $scope.findChapter = function () {
      $scope.chapters = Chapters.query();
      //console.log($scope.chapters);
    };

    // Find existing Chapter
    $scope.findOneChapter = function () {
      $scope.chapter = Chapters.get({
        chapterId: $stateParams.chapterId
      });
    };

 // Events
    $scope.test = "Hello World!";
     // Create new Events
    $scope.createEvent = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'eventForm');

        return false;
      }

      // Create new Chapter object
      var events = new Events({
        title: this.title,
        time: this.time,
        location: this.location,
        content: this.content
      });
      console.log(events);
      // Redirect after save
      events.$save(function (response) {
        $location.path('chapters');

        // Clear form fields
        $scope.title = '';
        $scope.time = '';
        $scope.location = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Events
    $scope.removeEvent = function (events) {
      if (events) {
        events.$remove();

        for (var i in $scope.events) {
          if ($scope.events[i] === events) {
            $scope.events.splice(i, 1);
          }
        }
      } else {
        $scope.events.$remove(function () {
          $location.path('events');
        });
      }
    };

    // Update existing Events
    $scope.updateEvent = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'eventForm');

        return false;
      }

      var events = $scope.events;

      events.$update(function () {
        $location.path('events/' + events._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Events
    $scope.findEvent = function () {
      $scope.events = Events.query();
      console.log(Events);
    };

    // Find existing Events
    $scope.findOneEvent = function () {
      $scope.events = Events.get({
        eventId: $stateParams.eventId
      });
    };   

  }
]);
