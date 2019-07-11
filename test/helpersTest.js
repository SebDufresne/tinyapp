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
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user,expectedOutput);
  });
});

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  'b6UTxQ': { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  'i3BoGr': { longURL: 'https://www.google.ca', userID: 'user2RandomID' }
};

describe('urlsForUser', function() {
  it('Confirms it returns strings of 6 characters', function() {
    const userID = 'userRandomID';
    const expectedOutput = { b2xVn2:
      { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
    b6UTxQ: { longURL: 'https://www.tsn.ca', userID: 'userRandomID' } };
    assert.deepEqual(urlsForUser(userID,urlDatabase),expectedOutput);
  });
});