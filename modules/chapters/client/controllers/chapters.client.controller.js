'use strict';

// Articles controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Chapters', 'SgrEvents', '$filter',
  function ($scope, $stateParams, $location, Authentication, Chapters, SgrEvents, $filter) {
    $scope.authentication = Authentication;
    $scope.sgrEvents = [];
    $scope.imageURL = 'modules/chapters/client/img/default.jpeg';

    /**************** Alerts *****************************/
    $scope.alerts = [];

    $scope.addAlert = function() {
      $scope.alerts.push({ type: 'success', msg: 'Success! Your new event has been created.' });
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    /**************** Chapter Angular Methods **************/
    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.chapters, {
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


    $scope.resetImageURL = function () {
      $scope.imageURL = 'modules/chapters/client/img/default.jpeg';
    };
    $scope.resetExistingImageURL = function () {
      $scope.chapter.profileImageURL = $scope.revert;
    };
    $scope.resetExistingDefault = function () {
      $scope.chapter.profileImageURL = 'modules/chapters/client/img/default.jpeg';
    };

    $scope.createChapter = function (isValid) {
      $scope.error = null;
      $scope.alerts.push({ type: 'success', msg: 'Success! Your new event has been created.' });
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
        content: this.content,
        profileImageURL: $scope.imageURL
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

      Chapters.query(function (data) {
        $scope.chapters = data;
        console.log('chapters');
        console.log($scope.chapters);
        $scope.buildPager();
      });
    };

    // Find existing Chapter
    $scope.findOneChapter = function () {
      $scope.chapter = Chapters.get({ chapterId: $stateParams.chapterId }, function () {
        $scope.revert = $scope.chapter.profileImageURL;
        console.log($scope.revert);
      });
    };

    $scope.checkSGREvent = function(){
      return $scope.sgrEvents;
    };

    /**************** Event Angular Methods **************/

    $scope.today = function() {
      $scope.date = new Date();
    };

    $scope.today();

    $scope.clear = function() {
      $scope.date = null;
    };

    $scope.inlineOptions = {
      customClass: getDayClass,
      minDate: new Date(),
      showWeeks: true
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      minDate: new Date(),
      startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function() {
      $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
      $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function() {
      $scope.popup1.opened = true;
    };

    $scope.open2 = function() {
      $scope.popup2.opened = true;
    };

    $scope.setDate = function(year, month, day) {
      $scope.date = new Date(year, month, day);
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

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);

        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    }

    /************** Time Picker Code *********************/
    $scope.sTime = new Date();
    $scope.eTime = new Date();

    $scope.hstep = 1;
    $scope.mstep = 1;

    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };

    // Not used Toggle if 12/24 clock
    $scope.ismeridian = true;
    $scope.toggleMode = function() {
      $scope.ismeridian = ! $scope.ismeridian;
    };
    // Not used Set the time to 2:00 PM
    $scope.update = function() {
      var d = new Date();
      d.setHours(14);
      d.setMinutes(0);
      $scope.mytime = d;
    };
    // Not used Clears the input field
    $scope.clear = function() {
      $scope.mytime = null;
    };

    /************** Create new Events *************/
    $scope.createEvent = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'sgrEventForm');

        return false;
      }
      /*
      if(sTime- eTime < 0){
        $scope.alerts.push({ type: 'warning', msg: 'Length in time is incorrect.' });
      }
      */
      // Create new Article object
      var sgrEvent = new SgrEvents({
        title: this.title,
        startTime: $scope.sTime,
        endTime: $scope.eTime,
        date: $scope.date,
        location: this.location,
        content: this.content,
        chapterId: $stateParams.chapterId
      });

      // Redirect after save
      sgrEvent.$save(function (response) {
        $location.path('chapters/'+ $stateParams.chapterId);

        // Clear form fields
        $scope.title = '';
        $scope.date = '';
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
      console.log(sgrEvent.chapterId);
      console.log(sgrEvent._id);
      //chapters/
      sgrEvent.$update(function () {
        $location.path('chapters/' + sgrEvent.chapterId);
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
