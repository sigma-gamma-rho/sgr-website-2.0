'use strict';

// Authentication service for guests
angular.module('users').service('Notifications', [
  function () {
    this.count= 0;

    this.countChange = function(count) {
      this.count = count;
    };
  }
]);
