'use strict';

// Setting up route
angular.module('chapters').config(['$stateProvider',
  function ($stateProvider) {
    // chapters/event state routing
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
