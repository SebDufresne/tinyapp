// Returns first userID based on email address, empty string if not present
const getUserByEmail = (email, database) => {
  const allValues = Object.values(database);
  const withEmail = allValues.filter(ele => ele.email === email);
  const user = withEmail[0] ? withEmail[0].id : '';
  return user;
};

module.exports = { getUserByEmail };