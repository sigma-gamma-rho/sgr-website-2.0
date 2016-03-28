'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Rssfeed = mongoose.model('Rssfeed'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, rssfeed;

/**
 * Rssfeed routes tests
 */
describe('Rssfeed CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Rssfeed
    user.save(function () {
      rssfeed = {
        name: 'Rssfeed name'
      };

      done();
    });
  });

  it('should be able to save a Rssfeed if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Rssfeed
        agent.post('/api/rssfeeds')
          .send(rssfeed)
          .expect(200)
          .end(function (rssfeedSaveErr, rssfeedSaveRes) {
            // Handle Rssfeed save error
            if (rssfeedSaveErr) {
              return done(rssfeedSaveErr);
            }

            // Get a list of Rssfeeds
            agent.get('/api/rssfeeds')
              .end(function (rssfeedsGetErr, rssfeedsGetRes) {
                // Handle Rssfeed save error
                if (rssfeedsGetErr) {
                  return done(rssfeedsGetErr);
                }

                // Get Rssfeeds list
                var rssfeeds = rssfeedsGetRes.body;

                // Set assertions
                (rssfeeds[0].user._id).should.equal(userId);
                (rssfeeds[0].name).should.match('Rssfeed name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Rssfeed if not logged in', function (done) {
    agent.post('/api/rssfeeds')
      .send(rssfeed)
      .expect(403)
      .end(function (rssfeedSaveErr, rssfeedSaveRes) {
        // Call the assertion callback
        done(rssfeedSaveErr);
      });
  });

  it('should not be able to save an Rssfeed if no name is provided', function (done) {
    // Invalidate name field
    rssfeed.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Rssfeed
        agent.post('/api/rssfeeds')
          .send(rssfeed)
          .expect(400)
          .end(function (rssfeedSaveErr, rssfeedSaveRes) {
            // Set message assertion
            (rssfeedSaveRes.body.message).should.match('Please fill Rssfeed name');

            // Handle Rssfeed save error
            done(rssfeedSaveErr);
          });
      });
  });

  it('should be able to update an Rssfeed if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Rssfeed
        agent.post('/api/rssfeeds')
          .send(rssfeed)
          .expect(200)
          .end(function (rssfeedSaveErr, rssfeedSaveRes) {
            // Handle Rssfeed save error
            if (rssfeedSaveErr) {
              return done(rssfeedSaveErr);
            }

            // Update Rssfeed name
            rssfeed.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Rssfeed
            agent.put('/api/rssfeeds/' + rssfeedSaveRes.body._id)
              .send(rssfeed)
              .expect(200)
              .end(function (rssfeedUpdateErr, rssfeedUpdateRes) {
                // Handle Rssfeed update error
                if (rssfeedUpdateErr) {
                  return done(rssfeedUpdateErr);
                }

                // Set assertions
                (rssfeedUpdateRes.body._id).should.equal(rssfeedSaveRes.body._id);
                (rssfeedUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Rssfeeds if not signed in', function (done) {
    // Create new Rssfeed model instance
    var rssfeedObj = new Rssfeed(rssfeed);

    // Save the rssfeed
    rssfeedObj.save(function () {
      // Request Rssfeeds
      request(app).get('/api/rssfeeds')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Rssfeed if not signed in', function (done) {
    // Create new Rssfeed model instance
    var rssfeedObj = new Rssfeed(rssfeed);

    // Save the Rssfeed
    rssfeedObj.save(function () {
      request(app).get('/api/rssfeeds/' + rssfeedObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', rssfeed.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Rssfeed with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/rssfeeds/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Rssfeed is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Rssfeed which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Rssfeed
    request(app).get('/api/rssfeeds/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Rssfeed with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Rssfeed if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Rssfeed
        agent.post('/api/rssfeeds')
          .send(rssfeed)
          .expect(200)
          .end(function (rssfeedSaveErr, rssfeedSaveRes) {
            // Handle Rssfeed save error
            if (rssfeedSaveErr) {
              return done(rssfeedSaveErr);
            }

            // Delete an existing Rssfeed
            agent.delete('/api/rssfeeds/' + rssfeedSaveRes.body._id)
              .send(rssfeed)
              .expect(200)
              .end(function (rssfeedDeleteErr, rssfeedDeleteRes) {
                // Handle rssfeed error error
                if (rssfeedDeleteErr) {
                  return done(rssfeedDeleteErr);
                }

                // Set assertions
                (rssfeedDeleteRes.body._id).should.equal(rssfeedSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Rssfeed if not signed in', function (done) {
    // Set Rssfeed user
    rssfeed.user = user;

    // Create new Rssfeed model instance
    var rssfeedObj = new Rssfeed(rssfeed);

    // Save the Rssfeed
    rssfeedObj.save(function () {
      // Try deleting Rssfeed
      request(app).delete('/api/rssfeeds/' + rssfeedObj._id)
        .expect(403)
        .end(function (rssfeedDeleteErr, rssfeedDeleteRes) {
          // Set message assertion
          (rssfeedDeleteRes.body.message).should.match('User is not authorized');

          // Handle Rssfeed error error
          done(rssfeedDeleteErr);
        });

    });
  });

  it('should be able to get a single Rssfeed that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Rssfeed
          agent.post('/api/rssfeeds')
            .send(rssfeed)
            .expect(200)
            .end(function (rssfeedSaveErr, rssfeedSaveRes) {
              // Handle Rssfeed save error
              if (rssfeedSaveErr) {
                return done(rssfeedSaveErr);
              }

              // Set assertions on new Rssfeed
              (rssfeedSaveRes.body.name).should.equal(rssfeed.name);
              should.exist(rssfeedSaveRes.body.user);
              should.equal(rssfeedSaveRes.body.user._id, orphanId);

              // force the Rssfeed to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Rssfeed
                    agent.get('/api/rssfeeds/' + rssfeedSaveRes.body._id)
                      .expect(200)
                      .end(function (rssfeedInfoErr, rssfeedInfoRes) {
                        // Handle Rssfeed error
                        if (rssfeedInfoErr) {
                          return done(rssfeedInfoErr);
                        }

                        // Set assertions
                        (rssfeedInfoRes.body._id).should.equal(rssfeedSaveRes.body._id);
                        (rssfeedInfoRes.body.name).should.equal(rssfeed.name);
                        should.equal(rssfeedInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Rssfeed.remove().exec(done);
    });
  });
});
