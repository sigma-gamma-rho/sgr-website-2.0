'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  SgrEvent = mongoose.model('SgrEvent'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Event
 */
exports.create = function (req, res) {
  var sgrEvent = new SgrEvent(req.body);
  sgrEvent.user = req.user;
  sgrEvent.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(sgrEvent);
    }
  });	
};

/**
 * Show the current Event
 */
exports.read = function (req, res) {
  res.json(req.sgrEvent);
};

/**
 * Update a Event
 */
exports.update = function (req, res) {
  var sgrEvent = req.event;

  sgrEvent.title = req.body.title;
  sgrEvent.time = req.body.time;
  sgrEvent.location = req.body.location;
  sgrEvent.content = req.body.content;

  sgrEvent.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(sgrEvent);
    }
  });
};

/**
 * Delete an Event
 */
exports.delete = function (req, res) {
  var sgrEvent = req.sgrEvent;

  sgrEvent.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(sgrEvent);
    }
  });
};

/**
 * List of Events
 */
exports.list = function (req, res) {
  SgrEvent.find().sort('-created').populate('user', 'displayName').exec(function (err, sgrEvents) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(sgrEvents);
    }
  });
};


/**
 * Event middleware
 */
exports.eventByID = function (req, res, next, id) {
  //console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'SgrEvent is invalid'
    });
  }
  SgrEvent.findById(id).populate('user', 'displayName').exec(function (err, sgrEvent) {
    if (err) {
      return next(err);
    } else if (!sgrEvent) {
      return res.status(404).send({
        message: 'No sgrEvent with that identifier has been found'
      });
    }
    req.sgrEvent = sgrEvent;
    next();
  });
};
