const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// Generate a random string of 6 hexa charaters
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
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
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" }
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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "seb@test.test",
    password: "$2b$10$8EEQI2mNVRXx6IfxY88XOe0xxh0jfQZvF3A5H2N7czUvnUNvALFBW"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

const createUniqueKey = (keyObject) => {
  let aKey;
  do {
    aKey = generateRandomString();
  } while (keyObject.hasOwnProperty(aKey));
  return aKey;
};

const lookupEmail = (userList, email) => {
  const allValues = Object.values(userList);
  const withEmail = allValues.filter(ele => ele.email === email);
  return withEmail[0] ? withEmail[0].id : '';
};

app.get("/register", (req, res) => {
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user, urls: urlDatabase };
  res.render('register', templateVars);
});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).send("Fields can't be empty.");
  } else if (lookupEmail(users,req.body.email)) {
    res.status(400).send("Email already registered to a user.");
  } else {
    const uniqID = createUniqueKey(urlDatabase);
    users[uniqID] = {id : uniqID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
    res.cookie('user_id',uniqID);
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user, urls: urlDatabase };
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  const idFromEmail = lookupEmail(users,req.body.email);
  if (!idFromEmail) {
    res.status(403).send("Email doesn't match a valid email");
    
  } else if (bcrypt.compareSync(req.body.password,users[idFromEmail].password)) {
    res.cookie('user_id',idFromEmail);
    res.redirect("/urls");
  } else {
    res.status(403).send("Password doesn't match");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id',req.body.name);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user, urls: urlsForUser(user.id) };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  
  if (urlDatabase[req.body.shortURL]) {
    urlDatabase[req.body.shortURL] = req.body.longURL;
  } else {
    const randomKey = createUniqueKey(urlDatabase);
    urlDatabase[randomKey] = req.body.longURL;
  }
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user,  urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies['user_id']] || '';
  if (!user) {
    res.redirect("/login");
  }
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user,  urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/update", (req, res) => {
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const {shortURL, longURL} = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  urlDatabase[shortURL] = longURL;
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies['user_id']] || '';
  const templateVars = {user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
