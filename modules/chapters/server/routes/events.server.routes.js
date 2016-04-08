'use strict';

/**
 * Module dependencies.
 */
var eventsPolicy = require('../policies/events.server.policy'),
  events = require('../controllers/events.server.controller');

module.exports = function(app) {
  // Events collection routes
  app.route('/api/events').all(eventsPolicy.isAllowed)
    .get(events.list)
    .post(events.create);

  // Single event routes
  app.route('/api/events/:eventId').all(eventsPolicy.isAllowed)
    .get(events.read)
    .put(events.update)
    .delete(events.delete);

  // Finish by binding the event middleware
  app.param('eventId', events.eventByID);
};
