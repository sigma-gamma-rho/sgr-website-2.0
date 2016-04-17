'use strict';

angular.module('users.admin').controller('ContentController', ['$scope','Authentication', '$location', '$window', '$http',
  function ($scope, Authentication, $location, $window, $http) {
    $scope.authentication = Authentication;

    // initialize view
    $scope.init = function (){
      $http.get('api/content').success(function (response) {
        $scope.schemaId = response[0]._id;
        $scope.rss = response[0].rss;
        $scope.carousel = response[0].carousel;
      }).error(function (response) {
        // If error on chapter fetch, do not allow signup until resolved
        $location.path('/server-error');
      });
    };
    $scope.init();

    // only add if last position is not null
    $scope.addRSS = function() {
      console.log($scope.rss[$scope.rss.length-1]);

      if($scope.rssError){
        $scope.rssError = null;
      }

      if($scope.rss[$scope.rss.length-1].title && $scope.rss[$scope.rss.length-1].content){
        $scope.rss.push({ title : '', content: '' });
      } else{
        $scope.rssError= 'Please fill the last item before trying to add more.';
      }
    };

    // if the first item is the last item, simply do the default
    $scope.removeRSS = function(index) {
      if($scope.rssError){
        $scope.rssError = null;
      }

      if ($scope.rss.length-1 === 0){
        $scope.rssError= 'Must have at least one item';
      }
      else{
        $scope.rss.splice(index, 1);
      }
    };

    // only add if last position is not null
    $scope.addCarousel = function() {

      if($scope.carouselError){
        $scope.carouselError = null;
      }

      console.log($scope.carousel[$scope.carousel.length-1]);


      if($scope.carousel[$scope.carousel.length-1].image && $scope.carousel[$scope.carousel.length-1].text){
        $scope.carousel.push({ image : '', text: '' });
      } else{
        $scope.carouselError= 'Please fill the last item before trying to add more.';
      }
    };

    // if the first item is the last item, simply do the default
    $scope.removeCarousel = function(index) {

      if($scope.carouselError){
        $scope.carouselError = null;
      }

      if ($scope.carousel.length-1 === 0){
        $scope.carouselError= 'Must have at least one item';
      }
      else{
        $scope.carousel.splice(index, 1);
      }
    };


    $scope.update = function () {

      // Reset the ids on the carousel
      for (var i = 0; i < $scope.carousel.length; i++){
        $scope.carousel[i].id = i;
      }

      // Update the schema
      var data = {
        id: $scope.schemaId,
        rss: $scope.rss,
        carousel: $scope.carousel
      };

      $http.put('api/content', data).then(function (res){
        $scope.rssError = null;
        $scope.carouselError = null;
        $scope.success = true;
        $scope.rss = res.data.rss;
        $scope.carousel = res.data.carousel;
      });
    };
  }
]);
