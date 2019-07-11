const { assert } = require('chai');
const generateRandomString = require('../helpers.js').generateRandomString;
const getUserByEmail = require('../helpers.js').getUserByEmail;

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