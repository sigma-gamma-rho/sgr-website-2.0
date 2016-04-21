'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('chapters');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('chat');
ApplicationConfiguration.registerModule('angular-feeds-demo', ['feeds']);
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Configuring the chapters module
angular.module('chapters').run(['Menus',
  function (Menus) {
    // Add the chapters dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Chapters',
      state: 'chapters',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'chapters', {
      title: 'List chapters',
      state: 'chapters.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'chapters', {
      title: 'Create Chapter',
      state: 'chapters.create',
      roles: ['user', 'admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('chapters').config(['$stateProvider',
  function ($stateProvider) {
    // chapters state routing
    $stateProvider
      .state('edit-sgr-event', {
        url: '/edit-sgrevent/:sgrEventId',
        templateUrl: 'modules/chapters/client/views/edit-sgrevent.client.view.html',
      })
      .state('create-event', {
        url: '/create/:chapterId',
        templateUrl: 'modules/chapters/client/views/create-sgrevent.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('view-sgr-event', {
        url: '/event/:sgrEventId/:chapterId',
        templateUrl: 'modules/chapters/client/views/view-sgrevent.client.view.html',
      })
      .state('chapters', {
        abstract: true,
        url: '/chapters',
        template: '<ui-view/>'
      })
      .state('chapters.list', {
        url: '',
        templateUrl: 'modules/chapters/client/views/list-chapters.client.view.html'
      })
      .state('chapters.create', {
        url: '/create',
        templateUrl: 'modules/chapters/client/views/create-chapter.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('chapters.view', {
        url: '/:chapterId',
        templateUrl: 'modules/chapters/client/views/view-chapter.client.view.html'
      })
      .state('chapters.edit', {
        url: '/:chapterId/edit',
        templateUrl: 'modules/chapters/client/views/edit-chapter.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

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

'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('chapters').factory('Chapters', ['$resource',
  function ($resource) {
    return $resource('api/chapters/:chapterId', {
      chapterId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

(function () {
  'use strict';

  angular
    .module('chapters').factory('Events', EventsService);

  EventsService.$inject = ['$resource'];
  function EventsService($resource) {
    return $resource('api/events/:eventId', {
      eventId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

'use strict';

//SgrEvents service used for communicating with the SgrEvents REST endpoints
angular.module('chapters').factory('SgrEvents', ['$resource',
  function ($resource) {
    return $resource('api/sgrEvents/:sgrEventId', {
      sgrEventId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Configuring the Chat module
angular.module('chat').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Regional',
      state: 'chat'
    });
  }
]);

'use strict';

// Configure the 'chat' module routes
angular.module('chat').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('chat', {
        url: '/regional',
        templateUrl: 'modules/chat/client/views/chat.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

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

/*Testing*/

'use strict';

// Returns RSS feed using googles feed parser
angular.module('chat').factory('FeedService', ['$http',
  function ($http) {
    return {
      parseFeed : function(url){
        return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
      }
    };
  }
]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', 'AdminGuestsCount', 'Notifications',
  function ($scope, $state, Authentication, Menus, AdminGuestsCount, Notifications) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Watch the number of guest requests
    // These change as we approve / deny guests
    Notifications.update();
    $scope.notifications = Notifications.count;
    $scope.$watch(
      function(){ return Notifications.count; },

      function(newVal) {
        $scope.notifications= newVal;
      }
    );

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

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

'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                //this.menus[menuId].items.push({

              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    //THIS ADDS MENUID = TOPBAR
    this.addMenuItem = function (menuId, options) {
      options = options || {};
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Guests',
      state: 'admin.guests'
    });
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Admins',
      state: 'admin.admins',
      roles: ['superadmin']
    });
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Content',
      state: 'admin.content',
      roles: ['superadmin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.guests', {
        url: '/guests',
        templateUrl: 'modules/users/client/views/admin/list-guests.client.view.html',
        controller: 'UserGuestController'
      })
      .state('admin.admins', {
        url: '/admins',
        templateUrl: 'modules/users/client/views/admin/list-admins.client.view.html',
        controller: 'UserAdminController'
      })
      .state('admin.content', {
        url: '/content',
        templateUrl: 'modules/users/client/views/admin/content.client.view.html',
        controller: 'ContentController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin', 'guest']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

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
      //console.log($scope.rss[$scope.rss.length-1]);

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

      //console.log($scope.carousel[$scope.carousel.length-1]);


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

'use strict';

angular.module('users.admin').controller('UserAdminController', ['$scope', '$filter', 'AdminAdmins', 'Admin', '$state', 'Notifications', 'Authentication', 'Users', '$location', '$window',
  function ($scope, $filter, AdminAdmins, Admin, $state, Notifications, Authentication, Users, $location, $window) {
    $scope.authentication = Authentication;

    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    AdminAdmins.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
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

    $scope.info = function (userId) {
      $state.go('admin.user', { userId: userId });
    };

    // ------------------------------------------------------------------
    // Modal Stuff
    $scope.setModalInformation = function (title, body, user, method){
      $scope.modalHeader = title;
      $scope.modalBody = body;
      $scope.user = user;
      $scope.modalMethod = method;
    };

    $scope.promote = function () {
      $scope.promoteNewSuperAdmin();
      $scope.demoteCurrentSuperAdmin();
    };

    $scope.promoteNewSuperAdmin = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {
        $scope.entry.roles.push('superadmin');
        $scope.entry.$update(function(res) {
          //console.log(res);
        });
      });
    };

    $scope.demoteCurrentSuperAdmin = function () {
      var oldAdmin = Admin.get({ userId: Authentication.user._id }, function() {
        var index = oldAdmin.roles.indexOf('superadmin');
        if (index > -1) {
          oldAdmin.roles.splice(index, 1);
        }
        oldAdmin.$update(function(res) {
          // Redirect to home page
          $window.location.href = '/';
        });
      });
    };

    // Deny the guests request to join
    $scope.demote = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {

        // change the guests role to user
        $scope.entry.roles = ['user'];

        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function() {
          $scope.users.splice($scope.users.indexOf($scope.user), 1);
          $scope.buildPager();
          Notifications.update();
        });
      });
    };

  }
]);

'use strict';

angular.module('users.admin').controller('UserGuestController', ['$scope', '$filter', 'AdminGuests', '$state', 'Admin', 'Notifications', 'Authentication',
  function ($scope, $filter, AdminGuests, $state, Admin, Notifications, Authentication) {

    $scope.authentication = Authentication;
    $scope.users = [];

    AdminGuests.query(function (data) {
      $scope.filterUsers(data);
      $scope.buildPager();
    });

    $scope.filterUsers = function (data) {
      // if the user is a super admin, show all
      if ($scope.isSuperAdmin($scope.authentication.user.roles)){
        //console.log('You are a superadmin. Showing all guests.');
        $scope.users = data;
      } else{
        // only list guests that have all their fields filled out
        //console.log('Only loading guests from the admins chapter, ' + $scope.authentication.user.affiliation);
        for (var i = 0; i < data.length; i ++){
          if (data[i].firstName && data[i].lastName && data[i].email && data[i].affiliation && data[i].username){
            if (data[i].affiliation === $scope.authentication.user.affiliation) {
              $scope.users.push(data[i]);
            } else {
              //console.log('Did not load ' + data[i].username + ' because they are affiliated with ' + data[i].affiliation);
            }
          } else{
            //console.log('Did not load ' + data[i].username + ' because they are missing information.');
          }
        }
      }
    };

    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
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

    $scope.info = function (user) {
      $state.go('admin.user', { 'userId': user._id });
    };

    // ------------------------------------------------------------------
    // Modal Stuff
    $scope.setModalInformation = function (title, body, user, method){
      $scope.modalHeader = title;
      $scope.modalBody = body;
      $scope.user = user;
      $scope.modalMethod = method;
    };

    $scope.approve = function (){
      if ($scope.user.firstName && $scope.user.lastName && $scope.user.affiliation && $scope.user.email && $scope.user.username){
        $scope.entry = Admin.get({ userId: $scope.user._id }, function() {

          // change the guests role to user
          $scope.entry.roles = ['user'];

          // update the guest, rebuild the page, update the # of notificaitons
          $scope.entry.$update(function() {
            $scope.users.splice($scope.users.indexOf($scope.user), 1);
            $scope.buildPager();
            Notifications.update();
          });
        });

      } else {
        alert('Guests missing information cannot be promoted. Try again when this user has filled out their profile completely.');
      }
    };

    $scope.deny = function (){
      Admin.remove({ userId : $scope.user._id }, function (data) {
        $scope.users.splice($scope.users.indexOf($scope.user), 1);
        $scope.buildPager();
        Notifications.update();
      });
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$state', 'Notifications', 'Authentication',
  function ($scope, $filter, Admin, $state, Notifications, Authentication) {

    $scope.authentication = Authentication;
    $scope.users = [];

    Admin.query(function (data) {
      $scope.filterUsers(data);
      //$scope.users = data;
      $scope.buildPager();
    });

    $scope.filterUsers = function (data) {

      // Remove the superadmin, if present
      for (var i = 0; i < data.length; i++) {
        if ($scope.isSuperAdmin(data[i].roles)){
          //console.log('Removing the superadmin from data');
          data.splice(i, 1);
        }
      }

      // if the user is a super admin, show all users from all chapters
      if ($scope.isSuperAdmin($scope.authentication.user.roles)){
        //console.log('You are a superadmin. Showing all users.');
        $scope.users = data;
      } else {
        // only list guests from the admins chapter
        //console.log('Only loading guests from the admins chapter, ' + $scope.authentication.user.affiliation);
        for (i = 0; i < data.length; i ++){
          if (data[i].affiliation === $scope.authentication.user.affiliation) {
            $scope.users.push(data[i]);
          } else {
            //console.log('Did not load ' + data[i].username + ' because they are affiliated with ' + data[i].affiliation);
          }
        }
      }
    };

    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    $scope.isAdmin = function(roles) {
      return roles.indexOf('admin') !== -1;
    };

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
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

    $scope.info = function (userId) {
      $state.go('admin.user', { userId: userId });
    };

    // *********************
    // Modal Stuff
    // Promote the user to an admin
    $scope.setModalInformation = function (title, body, user, method){
      $scope.modalHeader = title;
      $scope.modalBody = body;
      $scope.user = user;
      $scope.modalMethod = method;
    };

    $scope.promote = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {
        // change the guests role to user
        $scope.entry.roles = ['admin'];

        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function() {
          $scope.users.splice($scope.users.indexOf($scope.user), 1);
          $scope.buildPager();
          Notifications.update();
        });
      });
    };

    $scope.demote = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {

        // change the guests role to user
        $scope.entry.roles = ['guest'];

        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function() {
          $scope.users.splice($scope.users.indexOf($scope.user), 1);
          $scope.buildPager();
          Notifications.update();
        });
      });
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', 'Notifications', 'AdminGuestsCount', '$http', '$location',
  function ($scope, $state, Authentication, userResolve, Notifications, AdminGuestsCount, $http, $location) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;
    $scope.chapters = [];
    $scope.usersChapter= { id : null };


    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    $scope.isAdmin = function(roles) {
      return roles.indexOf('admin') !== -1;
    };

    // populate dropdown
    $scope.getChapters = function (response){
      for (var i = 0; i < response.length; i ++){
        if (response[i].title === $scope.user.affiliation){
          $scope.usersChapter = { id : i };
        }
        $scope.chapters.push({ id : i, name: response[i].title });
      }
    };

    // initialize view
    $scope.init = function (){
      $http.get('api/chapters').success(function (response) {

        if (!response.length){
          $location.path('/server-error');
        } else {
          // wrap in .then() for odd issue with failing promises
          $scope.user.$promise.then(function (res){
            $scope.user.affiliation = res.affiliation;
            $scope.getChapters(response);
          });
        }
      }).error(function (response) {
        // If error on chapter fetch, do not allow signup until resolved
        $location.path('/server-error');
      });
    };
    $scope.init();


    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();
          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      // must update the affiliation by checking as ng-model is not user.affiliation
      for (var i = 0; i < $scope.chapters.length ; i++){
        if ($scope.chapters[i].id === $scope.usersChapter.id){
          $scope.user.affiliation = $scope.chapters[i].name;
        }
      }

      var user = $scope.user;

      // Can't be a guest and something else at the same time
      if(user.roles.indexOf('guest') > -1 && user.roles.length>1){
        $scope.error = 'A user cannot be a guest and something else at the same time.';
      }
      else{

        user.$update(function (response) {

          // if we are updating the currently logged on user..
          if (response.username === $scope.authentication.user.username){
            Authentication.user = response;
          }
          Notifications.update();
          $state.go('admin.user', { userId: user._id });

        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'Menus', 'AdminGuestsCount', 'Notifications',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Menus, AdminGuestsCount, Notifications) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // On load, get the list of chapters for which to populate the dropdown
    $scope.data = { availableOptions: [] };
    $http.get('api/chapters').success(function (response) {
      // If no chapters exist, then do not allow signup until resolved
      if (!response.length){
        $location.path('/server-error');
      }
      // Populate the data array
      else {
        for (var i = 0; i < response.length; i ++){
          $scope.data.availableOptions.push(response[i].title);
        }
      }
    }).error(function (response) {
      // If error on chapter fetch, do not allow signup until resolved
      $location.path('/server-error');
    });

    $scope.sendMail = function(){

      // Send emails to superadmin, admin, and guest on signup
      var data = {
        firstName: $scope.credentials.firstName,
        lastName: $scope.credentials.lastName,
        affiliation: $scope.credentials.affiliation,
        email: $scope.credentials.email
      };

      $http.post('api/auth/sendEmails', data).then(function (res){
        //console.log(res);
      });

    };

    $scope.postUser = function(){
      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {

        // Only send email on successful posting of user
        $scope.sendMail();

        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);

      }).error(function (response) {
        $scope.error = response.message;
      });
    };



    $scope.signup = function (isValid) {
      $scope.error = null;

      // Check if the form is valid
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }
      // Post the user
      $scope.postUser();
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // Get the number of notifications if they are an admin
        Notifications.update();

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);


      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {


      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader', 'Users',
  function ($scope, $timeout, $window, Authentication, FileUploader, Users) {
    $scope.user = Authentication.user;
    // Default imageURL, the current users image
    $scope.imageURL = $scope.user.profileImageURL;

    $scope.uploadProfilePicture = function (isValid) {

      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      var user = new Users($scope.user);
      user.profileImageURL = $scope.imageURL;

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        $scope.user.profileImageURL = response.profileImageURL;

      }, function (response) {
        $scope.error = response.data.message;
      });
    };


    /* Previous implementation, using file system
    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };*/

  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication', '$interval',
  function ($scope, $http, $location, Users, Authentication, $interval) {

    $scope.user = Authentication.user;
    $scope.missing = false;
    $scope.isAGuest = false;

    // if they are missing information
    // this only ever can happen on a social singup
    // or by modifying the database directly
    if (!$scope.user.firstName || !$scope.user.lastName || !$scope.user.email || !$scope.user.affiliation || !$scope.user.username){
      $scope.missing = true;
      // if they are also a guest
      if ($scope.user.roles.indexOf('guest') !== -1){
        $scope.isAGuest = true;
      }
    }

    // On load, get the list of chapters for which to populate the dropdown
    $scope.chapters = [];
    $scope.usersChapter= { id : null };

    $http.get('api/chapters').success(function (response) {
      // If no chapters exist, then do not allow signup until resolved
      if (!response.length){
        $location.path('/server-error');
      }
      // Populate the data array
      else {
        for (var i = 0; i < response.length; i ++){
          if (response[i].title === $scope.user.affiliation){
            $scope.usersChapter = { id : i };
          }
          $scope.chapters.push({ id : i, name: response[i].title });
        }
      }
    }).error(function (response) {
      // If error on chapter fetch, do not allow signup until resolved
      $location.path('/server-error');
    });

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      // must update the affiliation by checking as ng-model is not user.affiliation
      for (var i = 0; i < $scope.chapters.length ; i++){
        if ($scope.chapters[i].id === $scope.usersChapter.id){
          $scope.user.affiliation = $scope.chapters[i].name;
        }
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        if ($scope.missing){
          $scope.missing = false;
          // Send email after they fill everything out
          if ($scope.isAGuest){
            // Send emails to superadmin, admin, and guest
            var data = {
              firstName: $scope.user.firstName,
              lastName: $scope.user.lastName,
              affiliation: $scope.user.affiliation,
              email: $scope.user.email
            };
            $http.post('api/auth/sendEmails', data).then(function (res){
              //console.log(res);
            });
          }
        }

      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

// Stuff

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// Authentication service for guests
angular.module('users').service('Notifications', ['Menus', 'Authentication', 'AdminGuests',
  function (Menus, Authentication, AdminGuests) {
    var self = this;
    self.authentication = Authentication;
    self.count= 0;

    self.countChange = function(count) {
      self.count = count;
    };

    // Get the number of guests
    self.getCount = function(){
      AdminGuests.query(function (data) {
        var count = self.getEligibleUsersCount(data);
        self.countChange(count);
      }, function(error){
        //console.log(error);
      });
    };

    self.getEligibleUsersCount = function (data) {
      // only list guests that have all their fields filled out, who are also part of the admins chapter
      var count = 0;
      if (self.isSuperAdmin(self.authentication.user.roles)){
        count = data.length;
      } else {
        for (var i = 0; i < data.length; i ++){
          if (data[i].firstName && data[i].lastName && data[i].email && data[i].affiliation && data[i].username && data[i].affiliation === self.authentication.user.affiliation){
            count++;
          }
        }
      }
      return count;
    };

    // If admin exists in the menu + and we have permissions, get the num of notifications
    self.updateCount = function(){
      self.menu = Menus.getMenu('topbar');
      for (var i = 0; i < self.menu.items.length; i ++){
        var obj = self.menu.items[i];
        for (var prop in obj){
          if (obj.hasOwnProperty(prop) && obj[prop] === 'Admin') {
            if (obj.shouldRender(Authentication.user)){
              self.getCount();
            }
          }
        }
      }
    };
    self.update = function(){
      self.updateCount();
    };

    self.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('AdminGuests', ['$resource',
  function ($resource) {
    return $resource('api/guests/:guestId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('AdminGuestsCount', ['$resource',
  function ($resource) {
    return $resource('api/guestcount', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('AdminAdmins', ['$resource',
  function ($resource) {
    return $resource('api/admins/:adminId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
