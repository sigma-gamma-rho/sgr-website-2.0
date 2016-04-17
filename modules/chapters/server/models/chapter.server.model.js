'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ChapterSchema = new Schema({
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
  president: {
    type: String,
    default: '',
    trim: true,
    required: 'President cannot be blank'
  },
  profileImageURL: {
    type: String,
    default: 'modules/chapters/client/img/default.jpeg'
  },
  presidentemail: {
    type: String,
    default: '',
    trim: true,
    required: 'Presidentemail cannot be blank'
  },
  vice: {
    type: String,
    default: '',
    trim: true,
    required: 'Vice cannot be blank'
  },
  viceemail: {
    type: String,
    default: '',
    trim: true,
    required: 'Viceemail cannot be blank'
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
  }
});

mongoose.model('Chapter', ChapterSchema);
