'use strict';

(function () {
  // Articles Controller Spec
  describe('Chapters Controller Tests', function () {
    // Initialize global variables
    var ChaptersController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Chapters,
      mockChapter;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Chapters_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Chapters = _Chapters_;

      // create mock article
      mockChapter = new Chapters({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'A Chapter about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Articles controller.
      ChaptersController = $controller('ChaptersController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one chapter object fetched from XHR', inject(function (Chapters) {
      // Create a sample articles array that includes the new article
      var sampleChapters = [mockChapter];

      // Set GET response
      $httpBackend.expectGET('api/chapters').respond(sampleChapters);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.chapters).toEqualData(sampleChapters);
    }));

    it('$scope.findOne() should create an array with one chapter object fetched from XHR using a articleId URL parameter', inject(function (Chapters) {
      // Set the URL parameter
      $stateParams.chapterId = mockChapter._id;

      // Set GET response
      $httpBackend.expectGET(/api\/chapters\/([0-9a-fA-F]{24})$/).respond(mockChapter);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.chapter).toEqualData(mockChapter);
    }));

    describe('$scope.create()', function () {
      var sampleChapterPostData;

      beforeEach(function () {
        // Create a sample article object
        sampleChapterPostData = new Chapters({
          title: 'An Chapter about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Chapter about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Chapters) {
        // Set POST response
        $httpBackend.expectPOST('api/chapters', sampleChapterPostData).respond(mockChapter);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the article was created
        expect($location.path.calls.mostRecent().args[0]).toBe('chapters/' + mockChapter._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/chapters', sampleChapterPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock article in scope
        scope.chapter = mockChapter;
      });

      it('should update a valid chapter', inject(function (Chapters) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/chapters\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/chapters/' + mockChapter._id);
      }));

      it('should set scope.error to error response message', inject(function (Chapters) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/chapters\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(chapter)', function () {
      beforeEach(function () {
        // Create new articles array and include the article
        scope.chapters = [mockChapter, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/chapters\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockChapter);
      });

      it('should send a DELETE request with a valid articleId and remove the chapter from the scope', inject(function (Chapters) {
        expect(scope.chapters.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.chapter = mockChapter;

        $httpBackend.expectDELETE(/api\/chapters\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to chapters', function () {
        expect($location.path).toHaveBeenCalledWith('chapters');
      });
    });
  });
}());
