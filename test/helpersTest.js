const { assert } = require('chai');
const generateRandomStr = require('../helpers').generateRandomStr;
const getUserByEmail = require('../helpers').getUserByEmail;
const urlsForUser = require('../helpers').urlsForUser;
const listVisitors = require('../helpers').listVisitors;

describe('generateRandomStr', function() {
  it('Confirms it returns strings of 6 characters', function() {
    const expectedLength = 6;
    assert.strictEqual(generateRandomStr().length,expectedLength);
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
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca',
    createdDate:'2019-07-11T20:05:23.334Z',
    userId: 'userRandomID',
    visited: {
      'b82da6': ['2019-07-12T02:14:29.343Z', '2019-07-12T02:14:38.574Z', '2019-07-12T02:14:45.547Z'],
      '6ac336' : ['2019-07-12T02:15:07.643Z']
    }
  },
  'b6UTxQ': { longURL: 'https://www.tsn.ca',
    createdDate:	'2019-07-11T20:05:23.334Z',
    userId: 'userRandomID',
    visited:	{}
  },
  '9sm5xK': { longURL: 'http://www.google.com',
    createdDate:	'2019-07-11T20:05:23.334Z',
    userId: 'user2RandomID',
    visited:	{}
  },
  'i3BoGr': { longURL: 'https://www.google.ca',
    createdDate:	'2019-07-11T20:05:23.334Z',
    userId: 'user2RandomID',
    visited:	{}
  }
};

describe('urlsForUser', function() {
  it('Returns list of URLs for a given userId', function() {
    const userId = 'userRandomID';
    const expectedOutput = { 'b2xVn2': { longURL: 'http://www.lighthouselabs.ca',
      createdDate:'2019-07-11T20:05:23.334Z',
      userId: 'userRandomID',
      visited: {
        'b82da6': ['2019-07-12T02:14:29.343Z', '2019-07-12T02:14:38.574Z', '2019-07-12T02:14:45.547Z'],
        '6ac336' : ['2019-07-12T02:15:07.643Z']
      }
    },
    'b6UTxQ': { longURL: 'https://www.tsn.ca',
      createdDate:	'2019-07-11T20:05:23.334Z',
      userId: 'userRandomID',
      visited:	{}
    }
    };
    

    assert.deepEqual(urlsForUser(userId,testDatabase),expectedOutput);
  });
  it('Returns an empty object if no URLs in DB with that username', function() {
    const userId = 'noOne';
    const expectedOutput = { };
    assert.deepEqual(urlsForUser(userId,testDatabase),expectedOutput);
  });
});

describe('listVisitors', function() {
  it('Returns empty array if no visitors went', function() {
    const urlId = 'noOne';
    const expectedOutput = [];
    assert.deepEqual(listVisitors(urlId,testDatabase),expectedOutput);
  });
  it('Returns an array of guestId for a given site', function() {
    const urlId = 'b2xVn2';
    const expectedOutput = ['6ac336','b82da6'];
    assert.deepEqual(listVisitors(urlId,testDatabase).sort(),expectedOutput);
  });
});