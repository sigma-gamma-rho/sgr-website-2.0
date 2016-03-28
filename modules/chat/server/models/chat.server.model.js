'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Chat Schema
 */
var ChatSchema = new Schema({
  	
  name: String,
  msg: String,
  created: { type: Date, default: Date.now },
  img: String

});

module.exports = mongoose.model('Chat', ChatSchema);
