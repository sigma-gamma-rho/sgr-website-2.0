'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Rssfeeds Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/rssfeeds',
      permissions: '*'
    }, {
      resources: '/api/rssfeeds/:rssfeedId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/rssfeeds',
      permissions: ['get', 'post']
    }, {
      resources: '/api/rssfeeds/:rssfeedId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/rssfeeds',
      permissions: ['get']
    }, {
      resources: '/api/rssfeeds/:rssfeedId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Rssfeeds Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Rssfeed is being processed and the current user created it then allow any manipulation
  if (req.rssfeed && req.user && req.rssfeed.user && req.rssfeed.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
