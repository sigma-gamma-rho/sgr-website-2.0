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
