'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * SgrEvent Schema
 */
var SgrEventSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  time: {
    type: String,
    default: '',
    trim: true,
    required: 'Time cannot be blank'
  },
  location: {
    type: String,
    default: '',
    trim: true,
    required: 'Location cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  chapterId: {
    type: String,
    default: '',
    trim: true
  }
});

mongoose.model('SgrEvent', SgrEventSchema);
