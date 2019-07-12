const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const moment = require('moment-timezone');
const generateRandomStr = require('./helpers.js').generateRandomStr;
const listVisitors = require('./helpers').listVisitors;
const listVisits = require('./helpers').listVisits;
const sortVisitListDesc = require('./helpers').sortVisitListDesc;

const createUniqueKey = require('./helpers').createUniqueKey;
const getUserByEmail = require('./helpers').getUserByEmail;
const urlsForUser = require('./helpers').urlsForUser;

const PORT = process.env.PORT || 8080; // default port 8080

const app = express();

// specify the static asset folder (css, images, etc)
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

const saltRounds = 10;
app.use(cookieSession({
  name: 'userSession',
  keys: ['ThingsPeopleSayArentAlwaysThingsPeopleThink', 'OnceIsEnoughButIsntTwoBetterThenThreeThenWhatIfNever']
}));

const urlDatabase = {
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

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '$2b$10$STqQSDAFepyPnfKpL.QYfOu2p7kk3wZ0s5lFSoHQQp91nJjMymYXG'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: '$2b$10$hF18oxdHmO/ToDB6S.QvD.5Gm0duoml5x0C1bkYKDnuiAQmFhOxqC'
  }
};

// Displays list of URLs in JSON format
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Displays login page if user isn't logged in
// Displays /urls if user is logged in
app.get('/', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Displays Register Page
// Redirect user to /urls if already lgged in
app.get('/register', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {user, statusCode: 200};
    res.render('register', templateVars);
  }
});

// Submits Register Page
// Gives error 400 if fields are empty or email is already in use
app.post('/register', (req, res) => {
  const user = users[req.session.userId] || '';
  if (!req.body.email || !req.body.password) {
    res.status(400);
  } else if (getUserByEmail(req.body.email,users)) {
    res.status(400);
  } else {
    const uniqId = createUniqueKey(urlDatabase);
    users[uniqId] = {id : uniqId, email: req.body.email, password: bcrypt.hashSync(req.body.password, saltRounds) };
    req.session.userId = uniqId;
    res.redirect('/urls');
  }

  if (res.statusCode === 400) {
    const templateVars = {user, statusCode: 400};
    res.render('register', templateVars);
  }
});

// Displays login page
// Redirect user to /urls if user is already logged in
app.get('/login', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = {user, statusCode: 200};
    res.render('login', templateVars);
  }
});

// Submits Login Page
// Gives error 403 if fields are empty or password doesn't match
app.post('/login', (req, res) => {
  const user = users[req.session.userId] || '';
  const idFromEmail = getUserByEmail(req.body.email,users);
  if (!idFromEmail) {
    res.status(403);
  } else if (!bcrypt.compareSync(req.body.password,users[idFromEmail].password)) {
    res.status(403);
  } else {
    req.session.userId = idFromEmail;
    res.redirect('/urls');
  }
  if (res.statusCode === 403) {
    const templateVars = {user, statusCode: 403};
    res.render('login', templateVars);
  }
});

// Logout user (removes cookie)
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Redirects to another page
// If shortURL doesn't exists, displays 404
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;

  // Make sure the user has a guestID cookie
  // Generates one if they don't
  const guestCookie = req.cookies['guestId'];
  const guestId = guestCookie || generateRandomStr();
  if (!guestCookie) {
    res.cookie('guestId',guestId);
  }

  if (urlDatabase[shortURL]) {
    // Increment visits
    if (!urlDatabase[shortURL].visited[guestId]) {
      urlDatabase[shortURL].visited[guestId] = [];
    }
    urlDatabase[shortURL].visited[guestId].push(new Date());

    // Page redirection
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    const user = users[req.session.userId] || '';
    const error = "The shortURL you're trying to access doesn't exist";
    const templateVars = {user, error};
    res.render('404',templateVars);
  }
});

// Displays a list of URLs for a user
// If the user isn't logged in, gives 404
app.get('/urls', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, urls: urlsForUser(user.id,urlDatabase), sortVisitListDesc, listVisits, moment};
  res.render('urls_index', templateVars);
});

// Adds a URL to the user profile
// If the user isn't logged in, gives 404
app.post('/urls', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    const shortURL = createUniqueKey(urlDatabase);
    urlDatabase[shortURL] = {longURL: req.body.longURL, createdDate: new Date(), userId: user.id, visited: {}};
    const url = urlDatabase[shortURL];
    const uniqVisitors = 0;
    const totalVisits = 0;
    const templateVars = {user, shortURL, url, uniqVisitors, totalVisits, moment};
    res.render('urls_show', templateVars);
  } else {
    const error = "You need to be logged in to add a shortURL";
    const templateVars = {user, error};
    res.render('404',templateVars);
  }
});

// Displays a form to add new URLs
// If the user isn't authenticated, returns to login page
app.get('/urls/new', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    const templateVars = {user};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// Displays the informations for a short url belonging to a user
// If the shortURL doesn't belong to the user, returns a 404
// If the shortURL doesn't exist, returns a 404
// If user isn't logged in, returns a 404
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.userId] || '';
  const shortURL = req.params.shortURL;
  if (user) {
    if (urlDatabase[shortURL]) {
      if (urlDatabase[shortURL].userId === user.id) {
        const url = urlDatabase[shortURL];
        const uniqVisitors = listVisitors(shortURL,urlDatabase).length;
        const totalVisits = listVisits(shortURL,urlDatabase).length;
        const templateVars = {user, shortURL, url, uniqVisitors, totalVisits, moment};
        res.render('urls_show', templateVars);
      } else {
        const error = "You can only view informations of your shortURLs";
        const templateVars = {user, error};
        res.render('404',templateVars);
      }
    } else {
      const error = "This shortURL doesn't exist";
      const templateVars = {user, error};
      res.render('404',templateVars);
    }
  } else {
    const error = "You need to be logged in to display the informations of a shortURL";
    const templateVars = {user, error};
    res.render('404',templateVars);
  }
});

// Modify a shortURL
// If the shortURL doesn't belong to the user, returns a 404
// If the shortURL doesn't exist, returns a 404
// If user isn't logged in, returns a 404
app.put('/urls/:shortURL', (req, res) => {
  const user = users[req.session.userId] || '';
  const shortURL = req.params.shortURL;
  if (user) {
    if (urlDatabase[shortURL]) {
      if (user.id === urlDatabase[shortURL].userId) {
        urlDatabase[shortURL].longURL = req.body.longURL;
        res.redirect('/urls');
      } else {
        const error = "You can only modify URLs belonging to you";
        const templateVars = {user, error};
        res.render('404',templateVars);
      }
    } else {
      const error = "The URL you're trying to modify doesn't exists";
      const templateVars = {user, error};
      res.render('404',templateVars);
    }
  } else {
    const error = "You need to be logged in to modify a shortURL";
    const templateVars = {user, error};
    res.render('404',templateVars);
  }
});

// Deletes a user shortURL
// If the shortURL doesn't belong to the user, returns a 404
// If the shortURL doesn't exist, returns a 404
// If user isn't logged in, returns a 404
app.delete('/urls/:shortURL', (req, res) => {
  const user = users[req.session.userId] || '';
  const shortURL = req.params.shortURL;
  if (user) {
    if (urlDatabase[shortURL]) {
      if (user.id === urlDatabase[shortURL].userId) {
        delete urlDatabase[shortURL];
        res.redirect('/urls');
      } else {
        const error = "You can only delete a URL that belongs to you";
        const templateVars = {user, error};
        res.render('404',templateVars);
      }
    } else {
      const error = "The shortURL you're trying to delete doesn't exists";
      const templateVars = {user, error};
      res.render('404',templateVars);
    }
  } else {
    const error = "You need to be logged in to delete a shortURL";
    const templateVars = {user, error};
    res.render('404',templateVars);
  }
});

// If the content isn't found redirect to 404
app.use((req, res) => {
  const user = users[req.session.userId] || '';
  const error = 'UNKOWN ERROR, the developer screwed up somewhere, ごめんなさい =^.^=';
  const templateVars = {user, error};
  res.render('404',templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});