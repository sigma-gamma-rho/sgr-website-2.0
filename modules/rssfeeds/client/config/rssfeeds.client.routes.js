(function () {
  'use strict';

  angular
    .module('rssfeeds')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('rssfeeds', {
        abstract: true,
        url: '/rssfeeds',
        template: '<ui-view/>'
      })
      .state('rssfeeds.list', {
        url: '',
        templateUrl: 'modules/rssfeeds/client/views/list-rssfeeds.client.view.html',
        controller: 'RssfeedsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Rssfeeds List'
        }
      })
      .state('rssfeeds.create', {
        url: '/create',
        templateUrl: 'modules/rssfeeds/client/views/form-rssfeed.client.view.html',
        controller: 'RssfeedsController',
        controllerAs: 'vm',
        resolve: {
          rssfeedResolve: newRssfeed
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Rssfeeds Create'
        }
      })
      .state('rssfeeds.edit', {
        url: '/:rssfeedId/edit',
        templateUrl: 'modules/rssfeeds/client/views/form-rssfeed.client.view.html',
        controller: 'RssfeedsController',
        controllerAs: 'vm',
        resolve: {
          rssfeedResolve: getRssfeed
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Rssfeed {{ rssfeedResolve.name }}'
        }
      })
      .state('rssfeeds.view', {
        url: '/:rssfeedId',
        templateUrl: 'modules/rssfeeds/client/views/view-rssfeed.client.view.html',
        controller: 'RssfeedsController',
        controllerAs: 'vm',
        resolve: {
          rssfeedResolve: getRssfeed
        },
        data:{
          pageTitle: 'Rssfeed {{ articleResolve.name }}'
        }
      });
  }

  getRssfeed.$inject = ['$stateParams', 'RssfeedsService'];

  function getRssfeed($stateParams, RssfeedsService) {
    return RssfeedsService.get({
      rssfeedId: $stateParams.rssfeedId
    }).$promise;
  }

  newRssfeed.$inject = ['RssfeedsService'];

  function newRssfeed(RssfeedsService) {
    return new RssfeedsService();
  }
})();
