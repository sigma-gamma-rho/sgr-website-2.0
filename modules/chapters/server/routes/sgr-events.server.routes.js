'use strict';

/**
 * Module dependencies.
 */
var eventsPolicy = require('../policies/sgr-events.server.policy'),
  sgrEvents = require('../controllers/sgr-events.server.controller');

module.exports = function(app) {
  // Events collection routes
  app.route('/api/sgrEvents').all(eventsPolicy.isAllowed)
    .get(sgrEvents.list)
    .post(sgrEvents.create);

  // Single event routes
  app.route('/api/sgrEvents/:sgrEventId').all(eventsPolicy.isAllowed)
    .get(sgrEvents.read)
    .put(sgrEvents.update)
    .delete(sgrEvents.delete);

  // Finish by binding the event middleware
  app.param('sgrEventId', sgrEvents.sgrEventByID);
};
