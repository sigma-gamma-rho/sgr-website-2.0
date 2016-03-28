'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Rssfeed Schema
 */
var RssfeedSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Rssfeed name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Rssfeed', RssfeedSchema);
