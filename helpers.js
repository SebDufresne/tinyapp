const uuidv4 = require('uuid/v4');

// Returns first userID based on email address, empty string if not present
const getUserByEmail = (email, database) => {
  const allValues = Object.values(database);
  const withEmail = allValues.filter(ele => ele.email === email);
  const user = withEmail[0] ? withEmail[0].id : '';
  return user;
};

// Generate a random string of 6 hexa charaters
const generateRandomString = () => {
  return uuidv4().slice(0,6);
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
module.exports = {
  generateRandomString,
  getUserByEmail,
};