'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  sgrEvent = mongoose.model('SgrEvent'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Event
 */
exports.create = function (req, res) {
  var event = new sgrEvent(req.body);
  event.user = req.user;
  console.log('~~~~~~~~ READING ~~~~~~~~');
  event.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(event);
    }
  });	
};

/**
 * Show the current Event
 */
exports.read = function (req, res) {
  console.log('~~~~~~~~ READING ~~~~~~~~');
  res.json(req.event);
};

/**
 * Update a Event
 */
exports.update = function (req, res) {
  var event = req.event;

  event.title = req.body.title;
  event.time = req.body.time;
  event.location = req.body.location;
  event.content = req.body.content;

  event.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(event);
    }
  });
};

/**
 * Delete an Event
 */
exports.delete = function (req, res) {
  var event = req.event;

  event.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(event);
    }
  });
};

/**
 * List of Events
 */
exports.list = function (req, res) {
  Event.find().sort('-created').populate('user', 'displayName').exec(function (err, events) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(events);
    }
  });
};


/**
 * Event middleware
 */
exports.eventByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Chapter is invalid'
    });
  }

  Event.findById(id).populate('user', 'displayName').exec(function (err, sgrEvents) {
    if (err) {
      return next(err);
    } else if (!sgrEvents) {
      return res.status(404).send({
        message: 'No event with that identifier has been found'
      });
    }
    req.sgrEvent = sgrEvents;
    next();
  });
};
