'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Content Schema
 */
var ContentSchema = new Schema({
  rss: [
    { title: String,
      content: String
    }
  ],
  carousel: [
    { id: Number,
      image: String,
      text: String
    }
  ],
  history: {
    type: String,
    required: 'History is required'
  },
  video: {
    type: String,
    required: 'Video is required'
  },

});

module.exports = mongoose.model('Content', ContentSchema);
