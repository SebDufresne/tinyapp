const { assert } = require('chai');
const generateRandomString = require('../helpers.js').generateRandomString;
const getUserByEmail = require('../helpers.js').getUserByEmail;
const urlsForUser = require('../helpers').urlsForUser;

describe('generateRandomString', function() {
  it('Confirms it returns strings of 6 characters', function() {
    const expectedLength = 6;
    assert.strictEqual(generateRandomString().length,expectedLength);
  });
});

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

describe('getUserByEmail', function() {
  it('Return a user based on a submitted email', function() {
    const user = 'user@example.com';
    const expectedOutput = 'userRandomID';
    assert.strictEqual(getUserByEmail(user, testUsers),expectedOutput);
  });
  it("Return an empty string if user doesn't exist", function() {
    const user = 'noOne@example.com';
    const expectedOutput = '';
    assert.strictEqual(getUserByEmail(user, testUsers),expectedOutput);
  });
});

const testDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  'b6UTxQ': { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  'i3BoGr': { longURL: 'https://www.google.ca', userID: 'user2RandomID' }
};

describe('urlsForUser', function() {
  it('Returns list of URLs for a given userID', function() {
    const userID = 'userRandomID';
    const expectedOutput = { b2xVn2:
      { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
    b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' } };
    assert.deepEqual(urlsForUser(userID,testDatabase),expectedOutput);
  });
  it('Returns an empty object if no URLs in DB with that username', function() {
    const userID = 'noOne';
    const expectedOutput = { };
    assert.deepEqual(urlsForUser(userID,testDatabase),expectedOutput);
  });
});