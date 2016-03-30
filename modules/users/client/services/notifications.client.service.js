'use strict';

// Authentication service for guests
angular.module('users').service('Notifications', ['Menus', 'Authentication', 'AdminGuestsCount',
  function (Menus, Authentication, AdminGuestsCount) {
    var self = this;
    self.count= 0;

    self.countChange = function(count) {
      self.count = count;
    };

    // Get the number of guests
    self.getCount = function(){
      AdminGuestsCount.get(function (data) {
        self.countChange(data.count);
      }, function(error){
        console.log(error);
      });
    };

    self.update = function(){
      // Get the topbar menu
      self.menu = Menus.getMenu('topbar');

      // If admin exists in the menu + and we have permissions, get the num  of notifications
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
    }
  }
]);
