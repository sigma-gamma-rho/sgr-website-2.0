'use strict';

// Setting up route
angular.module('chapters').config(['$stateProvider',
  function ($stateProvider) {
    // chapters state routing
    $stateProvider
      .state('create-event', {
        url: '/create-event',
        templateUrl: 'modules/chapters/client/views/create-event.client.view.html',
      })
      .state('view-sgr-event', {
        url: '/sgrevent',
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
