'use strict';

/**
 * Module dependencies.
 */
var adminPolicy = require('../policies/admin.server.policy'),
  admin = require('../controllers/admin.server.controller');

module.exports = function (app) {
  // User route registration first. Ref: #713
  require('./users.server.routes.js')(app);

  app.route('/api/content')
    .get(admin.content)
    .put(adminPolicy.isAllowed, admin.putContent);

  app.route('/api/guestcount')
    .get(adminPolicy.isAllowed, admin.guestcount);

  // Guests collection routes
  app.route('/api/guests')
    .get(adminPolicy.isAllowed, admin.guestlist);

  // Admins collection routes
  app.route('/api/admins')
    .get(adminPolicy.isAllowed, admin.adminlist);

  // Users collection routes
  app.route('/api/users')
    .get(adminPolicy.isAllowed, admin.list);

  // Single user routes
  app.route('/api/users/:userId')
    .get(adminPolicy.isAllowed, admin.read)
    .put(adminPolicy.isAllowed, admin.update)
    .delete(adminPolicy.isAllowed, admin.delete);

  // Finish by binding the user middleware
  app.param('userId', admin.userByID);
};
