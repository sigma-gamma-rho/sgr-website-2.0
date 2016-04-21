'use strict';

// Rename this file to local.js for having a local configuration variables that

// will not get commited and pushed to remote repositories.

// Use it for your API keys, passwords, etc.

/* For example:*/

module.exports = {

  db: {

    uri: ,

    options: {

      user: '',

      pass: ''

    }

  },

  sessionSecret: process.env.SESSION_SECRET || 'youshouldchangethistosomethingsecret',
  facebook: {
    clientID: process.env.FACEBOOK_ID || '368173530019812',
    clientSecret: process.env.FACEBOOK_SECRET || '1047a3bc38a0b0162a8b302d1091d92d',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || '8dJic7ydI0Fj9WY2jpl7ic3py',
    clientSecret: process.env.TWITTER_SECRET || '5AriiVw3qEVQqKf55Jr9Q8fScFOjsET3DB4bkrL8dPmxU0WRyi',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || '267003924082-1f0e6ippd6attetmr75ihbn3gacpsadb.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_SECRET || 'alEW40Y6ZLcrNG7f82QkBDs1',
    callbackURL: '/api/auth/google/callback'
  }

};