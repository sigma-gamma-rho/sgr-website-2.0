'use strict';

/**
 * Module dependencies
 */
var rssfeedsPolicy = require('../policies/rssfeeds.server.policy'),
  rssfeeds = require('../controllers/rssfeeds.server.controller');

module.exports = function(app) {
  // Rssfeeds Routes
  app.route('/api/rssfeeds').all(rssfeedsPolicy.isAllowed)
    .get(rssfeeds.list)
    .post(rssfeeds.create);

  app.route('/api/rssfeeds/:rssfeedId').all(rssfeedsPolicy.isAllowed)
    .get(rssfeeds.read)
    .put(rssfeeds.update)
    .delete(rssfeeds.delete);

  // Finish by binding the Rssfeed middleware
  app.param('rssfeedId', rssfeeds.rssfeedByID);
};
