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
      roles: ['admin']
    });
  }
]);
