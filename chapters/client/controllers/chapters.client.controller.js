'use strict';

// Articles controller
angular.module('chapters').controller('ChaptersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Chapters',
  function ($scope, $stateParams, $location, Authentication, Chapters) {
    $scope.authentication = Authentication;

    // Create new Article
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'chapterForm');

        return false;
      }

      // Create new Article object
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

    // Remove existing Article
    $scope.remove = function (chapter) {
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

    // Update existing Article
    $scope.update = function (isValid) {
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
    $scope.find = function () {
      $scope.chapters = Chapters.query();
    };

    // Find existing Article
    $scope.findOne = function () {
      $scope.chapter = Chapters.get({
        chapterId: $stateParams.chapterId
      });
    };
  }
]);
