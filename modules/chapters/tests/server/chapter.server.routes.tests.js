'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chapter = mongoose.model('Chapter'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, chapter;

/**
 * Article routes tests
 */
describe('Chapter CRUD tests', function () {

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

    // Save a user to the test db and create new article
    user.save(function () {
      chapter = {
        title: 'Chapter Title',
        content: 'Chapter Content'
      };

      done();
    });
  });

  it('should be able to save a chapter if logged in', function (done) {
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

        // Save a new article
        agent.post('/api/chapters')
          .send(chapter)
          .expect(200)
          .end(function (chapterSaveErr, chapterSaveRes) {
            // Handle article save error
            if (chapterSaveErr) {
              return done(chapterSaveErr);
            }

            // Get a list of articles
            agent.get('/api/chapters')
              .end(function (chaptersGetErr, chaptersGetRes) {
                // Handle article save error
                if (chaptersGetErr) {
                  return done(chaptersGetErr);
                }

                // Get articles list
                var chapters = chaptersGetRes.body;

                // Set assertions
                (chapters[0].user._id).should.equal(userId);
                (chapters[0].title).should.match('Chapter Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save a chapter if not logged in', function (done) {
    agent.post('/api/chapters')
      .send(chapter)
      .expect(403)
      .end(function (chapterSaveErr, chapterSaveRes) {
        // Call the assertion callback
        done(chapterSaveErr);
      });
  });

  it('should not be able to save a chapter if no title is provided', function (done) {
    // Invalidate title field
    chapter.title = '';

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

        // Save a new article
        agent.post('/api/chapters')
          .send(chapter)
          .expect(400)
          .end(function (chapterSaveErr, chapterSaveRes) {
            // Set message assertion
            (chapterSaveRes.body.message).should.match('Title cannot be blank');

            // Handle article save error
            done(chapterSaveErr);
          });
      });
  });

  it('should be able to update a chapter if signed in', function (done) {
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

        // Save a new article
        agent.post('/api/chapters')
          .send(chapter)
          .expect(200)
          .end(function (chapterSaveErr, chapterSaveRes) {
            // Handle article save error
            if (chapterSaveErr) {
              return done(chapterSaveErr);
            }

            // Update article title
            chapter.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing article
            agent.put('/api/chapters/' + chapterSaveRes.body._id)
              .send(chapter)
              .expect(200)
              .end(function (chapterUpdateErr, chapterUpdateRes) {
                // Handle article update error
                if (chapterUpdateErr) {
                  return done(chapterUpdateErr);
                }

                // Set assertions
                (chapterUpdateRes.body._id).should.equal(chapterSaveRes.body._id);
                (chapterUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of articles if not signed in', function (done) {
    // Create new article model instance
    var chapterObj = new Chapter(chapter);

    // Save the article
    chapterObj.save(function () {
      // Request articles
      request(app).get('/api/chapters')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single chapter if not signed in', function (done) {
    // Create new article model instance
    var chapterObj = new Chapter(chapter);

    // Save the article
    chapterObj.save(function () {
      request(app).get('/api/chapters/' + chapterObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', chapter.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single chapter with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/chapters/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Chapter is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single chapter which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent article
    request(app).get('/api/chapters/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No chapter with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete a chapter if signed in', function (done) {
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

        // Save a new article
        agent.post('/api/chapters')
          .send(chapter)
          .expect(200)
          .end(function (chapterSaveErr, chapterSaveRes) {
            // Handle article save error
            if (chapterSaveErr) {
              return done(chapterSaveErr);
            }

            // Delete an existing article
            agent.delete('/api/chapters/' + chapterSaveRes.body._id)
              .send(chapter)
              .expect(200)
              .end(function (chapterDeleteErr, chapterDeleteRes) {
                // Handle article error error
                if (chapterDeleteErr) {
                  return done(chapterDeleteErr);
                }

                // Set assertions
                (chapterDeleteRes.body._id).should.equal(chapterSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete a chapter if not signed in', function (done) {
    // Set article user
    chapter.user = user;

    // Create new article model instance
    var chapterObj = new Chapter(chapter);

    // Save the article
    chapterObj.save(function () {
      // Try deleting article
      request(app).delete('/api/chapters/' + chapterObj._id)
        .expect(403)
        .end(function (chapterDeleteErr, chapterDeleteRes) {
          // Set message assertion
          (chapterDeleteRes.body.message).should.match('User is not authorized');

          // Handle article error error
          done(chapterDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Chapter.remove().exec(done);
    });
  });
});
