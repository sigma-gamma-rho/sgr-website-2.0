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
  startTime: {
    type: Date,
    default: Date.now,
    required: 'Start time cannot be blank'
  },
  endTime: {
    type: Date,
    default: Date.now,
    required: 'End time cannot be blank'
  },
  date: {
    type: Date,
    required: 'Date cannot be blank'
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
