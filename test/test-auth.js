/* eslint-disable-file no-unused-expressions: 0 */
const bcrypt = require('bcryptjs');
const chai = require('chai');
const expect = chai.expect; 
const mock = require('mock-require');
const User = require('./mock-user.js').User;

mock('mongoose', { 
  model() {
    return User;
  },
  connect() { }
});

const auth = require('../src/auth.js');

function failOnError(done, err) { 
  // we shouldn't get an error!
  expect.fail('error', 'success', 'expected success, but got error ' + JSON.stringify(err) + err);
  done();
}

function failOnSuccess(done, user) { 
  expect.fail('success', 'error', 'expected error, but got success ' + JSON.stringify(user));
  done();
}

describe('auth', function() {
  describe('register (success)', function() {
    it('should call the success callback by passing in a new user object if the registration is successful', function(done) {

      const username = '"save":"success","count":0';
      const password = 'success-test';
      const email = 'success@test.test';

      function success(user) { 
        // eslint-disable-next-line no-unused-expressions
        expect(user).to.not.be.empty;
        done();
      }

      auth.register(username, email, password, failOnError.bind(null, done), success);
    });

    it('should call the success callback with a user object such that the username and email are the same as those supplied to the User constructor if registration is successful', function(done) {

      const username = '"save":"success","count":0';
      const email = 'success@test.test';
      const password = 'success-test';

      function success(user) { 
        expect(user.username).to.equal(username);
        expect(user.email).to.equal(email);
        done();
      }

      auth.register(username, email, password, failOnError.bind(null, done), success);
    });

    it('should call the success callback with a user object such that the password is a hash that matches the hashed original password if the registration is successful', function(done) {

      const username = '"save":"success","count":0'; 
      const email = 'success@test.test';
      const password = 'success-test';

      function success(user) { 
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
          expect(passwordMatch).to.equal(true);
          done(); 
        });
      }
      auth.register(username, email, password, failOnError.bind(null, done), success);
    });
  });

  describe('register (error)', function() {

    it('should call error callback if registration did not succeed because of duplicate username', function(done) {

      const username = '"save":"success","count":1';
      const email = 'success@test.test';
      const password = 'success-test';

      function error(obj) { 
        expect(obj.message).to.equal('USERNAME ALREADY EXISTS');
        done();
      }

      auth.register(username, email, password, error, failOnSuccess.bind(null, done));
    });

    it('should call error callback if registration did not succeed because of database save error (missing field, etc.)', function(done) {

      const username = '"save":"error","count":0';
      const email = 'success@test.test';
      const password = 'success-test';

      function error(obj) { 
        expect(obj.message.startsWith('DOCUMENT SAVE ERROR')).to.equal(true);
        done();
      }

      auth.register(username, email, password, error, failOnSuccess.bind(null, done));
    });
  });
  describe('login (success)', function() {
    it('should call the success callback by passing in the user object associated with the succesful login', function(done) {

      const username = '"count":1'; 
      const password = 'success-test';

      function success(user) { 
        // eslint-disable-next-line no-unused-expressions
        expect(user.username).to.equal(username);
        done();
      }

      auth.login(username, password, failOnError.bind(null, done), success);
    });
  });

  describe('login (error)', function() {

    it('should call error callback if login did not succeed because user not found', function(done) {

      const username = '"count":0';
      const password = 'success-test';

      function error(obj) { 
        expect(obj.message.startsWith('USER NOT FOUND')).to.equal(true);
        done();
      }

      auth.login(username, password, error, failOnSuccess.bind(null, done));
    });

    it('should call error callback if login did not succeed because passwords do not match', function(done) {

      const username = '"count":1';
      const password = 'error-test';

      function error(obj) { 
        expect(obj.message.startsWith('PASSWORDS DO NOT MATCH')).to.equal(true);
        done();
      }

      auth.login(username, password, error, failOnSuccess.bind(null, done));
    });
  });
  describe('startAuthenticatedSession', function() {

    it('should add the user object to req.session', function(done) {
      const req = {session: {regenerate: () => {done();}}};
      const user = {username: 'username'};
      expect(req.session.hasOwnProperty('user')).to.equal(false);

      // eslint-disable-next-line no-undef, no-unused-vars
      auth.startAuthenticatedSession(req, user, (err) => { 
        expect(req.session.hasOwnProperty('user')).to.equal(true);
        // done();
      });
    });
  });
});
