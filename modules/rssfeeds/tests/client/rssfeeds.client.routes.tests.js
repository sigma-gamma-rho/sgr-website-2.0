(function () {
  'use strict';

  describe('Rssfeeds Route Tests', function () {
    // Initialize global variables
    var $scope,
      RssfeedsService;

    //We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _RssfeedsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      RssfeedsService = _RssfeedsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('rssfeeds');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/rssfeeds');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          RssfeedsController,
          mockRssfeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('rssfeeds.view');
          $templateCache.put('modules/rssfeeds/client/views/view-rssfeed.client.view.html', '');

          // create mock Rssfeed
          mockRssfeed = new RssfeedsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Rssfeed Name'
          });

          //Initialize Controller
          RssfeedsController = $controller('RssfeedsController as vm', {
            $scope: $scope,
            rssfeedResolve: mockRssfeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:rssfeedId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.rssfeedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            rssfeedId: 1
          })).toEqual('/rssfeeds/1');
        }));

        it('should attach an Rssfeed to the controller scope', function () {
          expect($scope.vm.rssfeed._id).toBe(mockRssfeed._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/rssfeeds/client/views/view-rssfeed.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          RssfeedsController,
          mockRssfeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('rssfeeds.create');
          $templateCache.put('modules/rssfeeds/client/views/form-rssfeed.client.view.html', '');

          // create mock Rssfeed
          mockRssfeed = new RssfeedsService();

          //Initialize Controller
          RssfeedsController = $controller('RssfeedsController as vm', {
            $scope: $scope,
            rssfeedResolve: mockRssfeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.rssfeedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/rssfeeds/create');
        }));

        it('should attach an Rssfeed to the controller scope', function () {
          expect($scope.vm.rssfeed._id).toBe(mockRssfeed._id);
          expect($scope.vm.rssfeed._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/rssfeeds/client/views/form-rssfeed.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          RssfeedsController,
          mockRssfeed;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('rssfeeds.edit');
          $templateCache.put('modules/rssfeeds/client/views/form-rssfeed.client.view.html', '');

          // create mock Rssfeed
          mockRssfeed = new RssfeedsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Rssfeed Name'
          });

          //Initialize Controller
          RssfeedsController = $controller('RssfeedsController as vm', {
            $scope: $scope,
            rssfeedResolve: mockRssfeed
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:rssfeedId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.rssfeedResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            rssfeedId: 1
          })).toEqual('/rssfeeds/1/edit');
        }));

        it('should attach an Rssfeed to the controller scope', function () {
          expect($scope.vm.rssfeed._id).toBe(mockRssfeed._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/rssfeeds/client/views/form-rssfeed.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
})();
