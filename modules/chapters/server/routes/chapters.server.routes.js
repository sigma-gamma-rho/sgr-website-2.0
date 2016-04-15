'use strict';

/**
 * Module dependencies.
 */
var chaptersPolicy = require('../policies/chapters.server.policy'),
  chapters = require('../controllers/chapters.server.controller');

module.exports = function (app) {
  // Chapters collection routes
  app.route('/api/chapters').all(chaptersPolicy.isAllowed)
    .get(chapters.list)
    .post(chapters.create);

  // Single chapter routes
  app.route('/api/chapters/:chapterId').all(chaptersPolicy.isAllowed)
    .get(chapters.read)
    .put(chapters.update)
    .delete(chapters.delete);

  // Finish by binding the chapters middleware
  app.param('chapterId', chapters.chapterByID);
};
