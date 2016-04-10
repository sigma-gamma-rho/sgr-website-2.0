'use strict';

// Articles controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Chapters', 'SgrEvents',
  function ($scope, $stateParams, $location, Authentication, Chapters, SgrEvents) {
    $scope.authentication = Authentication;
    $scope.sgrEvents = [];

    /**************** Chapter Angular Methods **************/
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


    // Find a list of Articles
    $scope.findChapter = function () {
      $scope.chapters = Chapters.query();
    };

    // Find existing Chapter
    $scope.findOneChapter = function () {
      $scope.chapter = Chapters.get({
        chapterId: $stateParams.chapterId
      });
    };

    $scope.checkSGREvent = function(){
      return $scope.sgrEvents;
    };
    /**************** Event Angular Methods **************/
    $scope.dateOptions = {
      dateDisabled: disabled,
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    };

    $scope.today = function() {
       $scope.date = new Date();
     };
     
     $scope.today();

     $scope.clear = function() {
       $scope.date = null;
     };

      // Disable weekend selection
    function disabled(data) {
      console.log('Testing: ');
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.open1 = function() {
      $scope.popup1.opened = true;
     };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
      opened: false
    };

    $scope.popup2 = {
      opened: false
    };


    // Create new Events
    $scope.createEvent = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'sgrEventForm');

        return false;
      }
      console.log($stateParams.chapterId);
      // Create new Article object
      var sgrEvent = new SgrEvents({
        title: this.title,
        time: this.time,
        date: this.date,
        location: this.location,
        content: this.content,
        chapterId: $stateParams.chapterId
      });

      // Redirect after save
      sgrEvent.$save(function (response) {
       $location.path('chapters/'+ $stateParams.chapterId);

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
    $scope.removeEvent = function (sgrEvent) {
      if (sgrEvent) {
        sgrEvent.$remove();

        for (var i in $scope.sgrEvents) {
          if ($scope.sgrEvents[i] === sgrEvent) {
            $scope.sgrEvents.splice(i, 1);
          }
        }
      } else {
        $scope.sgrEvent.$remove(function () {
          $location.path('chapters/'+ $stateParams.chapterId);
        });
      }
    };

    // Update existing Events
    $scope.updateEvent = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'sgrEventForm');

        return false;
      }

      var sgrEvent = $scope.sgrEvent;

      sgrEvent.$update(function () {
        $location.path('sgrEvents/' + sgrEvent._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Events for this chapter
    $scope.findEvent = function () {
      SgrEvents.query(function (data) {
        // Get the events that match this chapter
        for (var i = 0; i < data.length; i ++){
          if (data[i].chapterId === $stateParams.chapterId){
            $scope.sgrEvents.push(data[i]);
          }
        }
      });
    };


    // Find existing Event
    $scope.findOneEvent = function () {
      $scope.sgrEvent = SgrEvents.get({
        sgrEventId: $stateParams.sgrEventId
      });
    };
  }
]);
