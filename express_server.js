const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const createUniqueKey = require('./helpers').createUniqueKey;
const getUserByEmail = require('./helpers').getUserByEmail;

const PORT = process.env.PORT || 8080; // default port 8080

const app = express();

// specify the static asset folder (css, images, etc)
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const saltRounds = 10;
app.use(cookieSession({
  name: 'userSession',
  keys: ['ThingsPeopleSayArentAlwaysThingsPeopleThink', 'OnceIsEnoughButIsntTwoBetterThenThreeThenWhatIfNever']
}));

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  'b6UTxQ': { longURL: 'https://www.tsn.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  'i3BoGr': { longURL: 'https://www.google.ca', userID: 'user2RandomID' }
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

// Retrieve login page OR urls
app.get('/', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// Retrieve (GET) register page
app.get('/register', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, statusCode: 200};
  res.render('register', templateVars);
});

// Submit (POST) register page
app.post('/register', (req, res) => {
  const user = users[req.session.userId] || '';
  if (!req.body.email || !req.body.password) {
    res.status(400);
  } else if (getUserByEmail(req.body.email,users)) {
    res.status(400);
  } else {
    const uniqID = createUniqueKey(urlDatabase);
    users[uniqID] = {id : uniqID, email: req.body.email, password: bcrypt.hashSync(req.body.password, saltRounds) };
    res.cookie('user_id',uniqID);
    res.redirect('/urls');
  }

  if (res.statusCode === 400) {
    const templateVars = {user, statusCode: 400};
    res.render('register', templateVars);
  }
});

// Retrieve (GET) login page
app.get('/login', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, statusCode: 200};
  res.render('login', templateVars);
});

// Submit (POST) login page
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

// Logout functionnality (removes cookie)
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Redirect to another page through a (GET) request
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Retrieve (GET) and display a list of URLs for a user
app.get('/urls', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, urls: urlsForUser(user.id)};
  res.render('urls_index', templateVars);
});

// Give (GET) the user a form to add new URLs, if not authenticated, return to login page
app.get('/urls/new', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user};
  res.render('urls_new', templateVars);
});

// Adds (Post) URLs to the user profile
app.post('/urls', (req, res) => {
  const user = users[req.session.userId] || '';

  if (user) {
    const randomKey = createUniqueKey(urlDatabase);
    urlDatabase[randomKey] = {longURL: req.body.longURL, userID: user.id};
  }
  const templateVars = {user,  urls: urlsForUser(user.id)};
  res.render('urls_index', templateVars);
});

// Allows user to delete own URLs
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user.id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  const templateVars = {user,  urls: urlsForUser(user.id) };
  res.render('urls_index', templateVars);
});

// Display (GET) the informations for a short url
app.post('/urls/:shortURL/update', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, shortURL: req.params.shortURL, url: urlDatabase[req.params.shortURL], toUpdate : true};
  res.render('urls_show', templateVars);
});

// Display (GET) the informations for a short url
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, shortURL : req.params.shortURL, url: urlDatabase[req.params.shortURL], toUpdate : false};
  res.render('urls_show', templateVars);
});

// Process (POST) the form for modifying a URL
app.post('/urls/:shortURL', (req, res) => {
  const user = users[req.session.userId] || '';
  if (user.id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  const templateVars = {user, urls: urlsForUser(user.id)};
  res.render('urls_index', templateVars);
});

// If nothing is found, default of 404
app.use((req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user};
  res.render('404',templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});