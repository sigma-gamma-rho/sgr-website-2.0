'use strict';

/**
 * Module dependencies.
 */
var chat = require('../controllers/chat.server.controller');

module.exports = function (app) {

  app.route('/api/chat/docs')
    .get(chat.docs);

};
