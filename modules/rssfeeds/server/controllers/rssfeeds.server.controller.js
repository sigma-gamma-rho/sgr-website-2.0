'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Rssfeed = mongoose.model('Rssfeed'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Rssfeed
 */
exports.create = function(req, res) {
  var rssfeed = new Rssfeed(req.body);
  rssfeed.user = req.user;

  rssfeed.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rssfeed);
    }
  });
};

/**
 * Show the current Rssfeed
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var rssfeed = req.rssfeed ? req.rssfeed.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  rssfeed.isCurrentUserOwner = req.user && rssfeed.user && rssfeed.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(rssfeed);
};

/**
 * Update a Rssfeed
 */
exports.update = function(req, res) {
  var rssfeed = req.rssfeed ;

  rssfeed = _.extend(rssfeed , req.body);

  rssfeed.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rssfeed);
    }
  });
};

/**
 * Delete an Rssfeed
 */
exports.delete = function(req, res) {
  var rssfeed = req.rssfeed ;

  rssfeed.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rssfeed);
    }
  });
};

/**
 * List of Rssfeeds
 */
exports.list = function(req, res) { 
  Rssfeed.find().sort('-created').populate('user', 'displayName').exec(function(err, rssfeeds) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rssfeeds);
    }
  });
};

/**
 * Rssfeed middleware
 */
exports.rssfeedByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Rssfeed is invalid'
    });
  }

  Rssfeed.findById(id).populate('user', 'displayName').exec(function (err, rssfeed) {
    if (err) {
      return next(err);
    } else if (!rssfeed) {
      return res.status(404).send({
        message: 'No Rssfeed with that identifier has been found'
      });
    }
    req.rssfeed = rssfeed;
    next();
  });
};
