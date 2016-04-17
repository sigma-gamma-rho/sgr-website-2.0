'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication','$http','$location',
  function ($scope, Authentication, $http, $location) {

    // This provides Authentication context.
    $scope.authentication = Authentication;

    // initialize view
    $scope.init = function (){
      $http.get('api/content').success(function (response) {
        $scope.schemaId = response[0]._id;
        $scope.carousel = response[0].carousel;
      }).error(function (response) {
        // If error on chapter fetch, do not allow signup until resolved
        $location.path('/server-error');
      });
    };
    $scope.init();

    // Set up carousel
    $scope.myInterval = 5000;
    $scope.noWrapSlides = false;
    /*
    $scope.active = 0;
    var slides = $scope.slides = [];
    var currIndex = 0;
    $scope.addSlide = function() {
      var newWidth = 1800 + slides.length + 1;
      slides.push({
        image: 'http://lorempixel.com/' + newWidth + '/600',
        text: ['Nice image','Awesome photograph','That is so cool','I love that'][slides.length % 4],
        id: currIndex++
      });
    };

    $scope.randomize = function() {
      var indexes = generateIndexesArray();
      assignNewIndexesToSlides(indexes);
    };

    for (var i = 0; i < 4; i++) {
      $scope.addSlide();
    }

    // Randomize logic below

    function assignNewIndexesToSlides(indexes) {
      for (var i = 0, l = slides.length; i < l; i++) {
        slides[i].id = indexes.pop();
      }
    }

    function generateIndexesArray() {
      var indexes = [];
      for (var i = 0; i < currIndex; ++i) {
        indexes[i] = i;
      }
      return shuffle(indexes);
    }

    // http://stackoverflow.com/questions/962802#962890
    function shuffle(array) {
      var tmp, current, top = array.length;

      if (top) {
        while (--top) {
          current = Math.floor(Math.random() * (top + 1));
          tmp = array[current];
          array[current] = array[top];
          array[top] = tmp;
        }
      }

      return array;
    }*/
  }
]);
