const uuidv4 = require('uuid/v4');

// Generate a random string of 6 hexa charaters
const generateRandomStr = () => {
  return uuidv4().slice(0,6);
};

// Valdidate that the unique key isn't already in use by some other user
const createUniqueKey = database => {
  let aKey;
  do {
    aKey = generateRandomStr();
  } while (database.hasOwnProperty(aKey));
  return aKey;
};

// Returns first userId based on email address, empty string if not present
const getUserByEmail = (email, database) => {
  const allValues = Object.values(database);
  const withEmail = allValues.filter(ele => ele.email === email);
  const user = withEmail[0] ? withEmail[0].id : '';
  return user;
};

// Returns object with urls associated to an id. If no urls exists, returns empty objecté.
const urlsForUser = (userId, database) => {
  const userUrls = {};
  for (const urlId in database) {
    if (database[urlId].userId === userId) {
      userUrls[urlId] = database[urlId];
    }
  }
  return userUrls;
};

// Returns an array with all the visitors Id for a given urlId
// If none, returns empty Array
const listVisitors = (urlId, database) => {
  const visitorsList = [];
  if (database[urlId]) {
    for (const visitor in database[urlId].visited) {
      visitorsList.push(visitor);
    }
  }
  return visitorsList;
};

// Returns an array of Object {guestId: Date} for a given urlId
// If no visits, returns empty Array
const listVisits = (urlId, database) => {
  const visitsList = [];
  if (database[urlId]) {
    for (const visitor in database[urlId].visited) {
      for (const visit of database[urlId].visited[visitor]) {
        visitsList.push({[visitor] : visit});
      }
    }
  }
  return visitsList;
};

// Callback to sort by Dates in Ascending Order
const sortByDate = (obj1, obj2) => {
  return new Date(Object.values(obj1)[0]) - new Date(Object.values(obj2)[0]);
};

// Sort an array of Visits in descending Order
const sortVisitListDesc = (list, sortOrder) => {
  return list.sort(sortOrder).reverse();
};

module.exports = {
  createUniqueKey,
  listVisitors,
  listVisits,
  generateRandomStr,
  getUserByEmail,
  sortByDate,
  sortVisitListDesc,
  urlsForUser,
};