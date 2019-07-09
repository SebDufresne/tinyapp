const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

// Generate a random string of 6 hexa charaters
const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.post("/login", (req, res) => {
  res.cookie('username',req.body.name);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username',req.body.name);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  if (urlDatabase[req.body.shortURL]) {
    urlDatabase[req.body.shortURL] = req.body.longURL; 
  } else {
    const randomKey = createUniqueKey(urlDatabase);
    urlDatabase[randomKey] = req.body.longURL;
  }
  const templateVars = {username: req.cookies["username"],  urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = {username: req.cookies["username"],  urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/update", (req, res) => {
  const templateVars = {username: req.cookies["username"],  shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const {shortURL, longURL} = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  urlDatabase[shortURL] = longURL;
  const templateVars = {username: req.cookies["username"],  urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {username: req.cookies["username"],  shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
