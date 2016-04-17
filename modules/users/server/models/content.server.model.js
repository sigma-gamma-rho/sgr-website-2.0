'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Chat Schema
 */
var ContentSchema = new Schema({
  rss: [{ title: String, content: String }],
  carousel: [{ id: Number, image: String, text: String }],
});

module.exports = mongoose.model('Content', ContentSchema);
