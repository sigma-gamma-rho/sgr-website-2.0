'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Content = mongoose.model('Content'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Get site content
 */
exports.content = function (req, res) {
  Content.find().sort('-created').populate('user', 'displayName').exec(function (err, content) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(content);
    }
  });
};

exports.putContent = function (req, res) {


  Content.findById(req.body.id, function(err, schema) {
    if (err) {
      //console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {

      schema.rss = req.body.rss;
      schema.carousel = req.body.carousel;
      schema.save(function(err) {
        if (err) {
          //console.log(err);
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(schema);
        }
      });
    }
  });
};




/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;
  //For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles = req.body.roles;
  user.affiliation = req.body.affiliation;

  user.save(function (err) {
    if (err) {
      //console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};
/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({ roles: 'user' }, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
  //User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};
/**
 * List of Guests
 */
exports.guestlist = function (req, res) {
  User.find({ roles: 'guest' }, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};
/**
 * Count of Guests
 */
exports.guestcount = function (req, res) {
  User.count({ roles: 'guest' }, function (err, count) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json({ 'count' : count });
    //res.json([count]);
  });
};
/**
 * List of Guests
 */
exports.adminlist = function (req, res) {
  User.find({ roles: 'admin' }, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};
/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    next();
  });
};
