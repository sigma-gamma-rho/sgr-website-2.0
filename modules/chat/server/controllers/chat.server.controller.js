'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Chat = mongoose.model('Chat'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Get all chat docs
 */
exports.docs = function (req, res) {

  Chat.find().sort('-created').populate('user', 'displayName').exec(function (err, docs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(docs);
    }
  });
};
