const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const getUserByEmail = require('./helpers').getUserByEmail;

const PORT = process.env.PORT || 8080; // default port 8080

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const saltRounds = 10;
app.use(cookieSession({
  name: 'userSession',
  keys: ['ThingsPeopleSayArentAlwaysThingsPeopleThink', 'OnceIsEnoughButIsntTwoBetterThenThreeThenWhatIfNever']
}));

// Generate a random string of 6 hexa charaters
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

// Valdidate that the unique key isn't already in use by some other user
const createUniqueKey = (keyObject) => {
  let aKey;
  do {
    aKey = generateRandomString();
  } while (keyObject.hasOwnProperty(aKey));
  return aKey;
};

// Returns object with urls associated to an id. If no urls exists, returns empty objecté.
const urlsForUser = id => {
  const userUrls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      userUrls[urlId] = urlDatabase[urlId];
    }
  }
  return userUrls;
};



const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2b$10$STqQSDAFepyPnfKpL.QYfOu2p7kk3wZ0s5lFSoHQQp91nJjMymYXG"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$hF18oxdHmO/ToDB6S.QvD.5Gm0duoml5x0C1bkYKDnuiAQmFhOxqC"
  }
};

// Retrieve login page OR urls
app.get("/", (req, res) => {
  const user = users[req.session.userId] || '';
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Retrieve (GET) register page
app.get("/register", (req, res) => {
  const user = users[req.session.userId] || '';
  res.render('register', {user});
});

// Submit (POST) register page
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Fields can't be empty.");
  } else if (getUserByEmail(req.body.email,users)) {
    res.status(400).send("Email already registered to a user.");
  } else {
    const uniqID = createUniqueKey(urlDatabase);
    users[uniqID] = {id : uniqID, email: req.body.email, password: bcrypt.hashSync(req.body.password, saltRounds) };
    res.cookie('user_id',uniqID);
    res.redirect("/urls");
  }
});

// Retrieve (GET) login page
app.get("/login", (req, res) => {
  const user = users[req.session.userId] || '';
  res.render('login', {user});
});

// Submit (POST) login page
app.post("/login", (req, res) => {
  const idFromEmail = getUserByEmail(req.body.email,users);
  if (!idFromEmail) {
    res.status(403).send("Email doesn't match a valid email");
  } else if (bcrypt.compareSync(req.body.password,users[idFromEmail].password)) {
    req.session.userId = idFromEmail;
    // res.cookie('user_id',idFromEmail);
    res.redirect("/urls");
  } else {
    res.status(403).send("Password doesn't match");
  }
});

// Logout functionnality (removes cookie)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Redirect to another page through a (GET) request
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Retrieve (GET) and display a list of URLs for a user
app.get("/urls", (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, urls: urlsForUser(user.id)};
  res.render('urls_index', templateVars);
});

// Give (GET) the user a form to add new URLs, if not authenticated, return to login page
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userId] || '';
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

// Adds (Post) URLs to the user profile
app.post("/urls", (req, res) => {
  const user = users[req.session.userId] || '';

  if (user) {
    const randomKey = createUniqueKey(urlDatabase);
    urlDatabase[randomKey] = {longURL: req.body.longURL, userID: user.id};
  }
  const templateVars = {user,  urls: urlsForUser(user.id)};
  res.render("urls_index", templateVars);
});

// Allows user to delete own URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.userId] || '';
  if (user.id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
  }
  const templateVars = {user,  urls: urlsForUser(user.id) };
  res.render("urls_index", templateVars);
});

// Display (GET) the informations for a short url
app.post("/urls/:shortURL/update", (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, shortURL: req.params.shortURL, url: urlDatabase[req.params.shortURL], toUpdate : true};
  res.render("urls_show", templateVars);
});

// Display (GET) the informations for a short url
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userId] || '';
  const templateVars = {user, shortURL : req.params.shortURL, url: urlDatabase[req.params.shortURL], toUpdate : false};
  res.render("urls_show", templateVars);
});

// Process (POST) the form for modifying a URL
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userId] || '';
  if (user.id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  const templateVars = {user, urls: urlsForUser(user.id)};
  res.render("urls_index", templateVars);
});

// If nothing is found, default of 404
app.use((req, res) => {
  res.render('404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
