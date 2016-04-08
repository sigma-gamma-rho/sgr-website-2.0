'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Chapter = mongoose.model('Chapter'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a article
 */
exports.create = function (req, res) {
  var chapter = new Chapter(req.body);
  chapter.user = req.user;

  chapter.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(chapter);
    }
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.chapter);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
  var chapter = req.chapter;

  chapter.title = req.body.title;
  chapter.president= req.body.president;
  chapter.presidentemail= req.body.presidentemail;
  chapter.vice= req.body.viceemail;
  chapter.location = req.body.location;
  chapter.content = req.body.content;

  chapter.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(chapter);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var chapter = req.chapter;

  chapter.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(chapter);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  Chapter.find().sort('-created').populate('user', 'displayName').exec(function (err, chapters) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(chapters);
    }
  });
};

/**
 * Article middleware
 */
exports.chapterByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Chapter is invalid'
    });
  }

  Chapter.findById(id).populate('user', 'displayName').exec(function (err, chapter) {
    if (err) {
      return next(err);
    } else if (!chapter) {
      return res.status(404).send({
        message: 'No chapter with that identifier has been found'
      });
    }
    req.chapter = chapter;
    next();
  });
};
