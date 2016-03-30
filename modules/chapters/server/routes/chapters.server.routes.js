'use strict';

/**
 * Module dependencies.
 */
var chaptersPolicy = require('../policies/chapters.server.policy'),
  chapters = require('../controllers/chapters.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/chapters').all(chaptersPolicy.isAllowed)
    .get(chapters.list)
    .post(chapters.create);

  // Single article routes
  app.route('/api/chapters/:chapterId').all(chaptersPolicy.isAllowed)
    .get(chapters.read)
    .put(chapters.update)
    .delete(chapters.delete);

    

  // Finish by binding the article middleware
  app.param('chapterId', chapters.chapterByID);
};
