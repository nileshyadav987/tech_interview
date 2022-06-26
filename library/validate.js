const { body } = require("express-validator");

module.exports.email = function () {
  return [body("email", "Email is required").exists().not().isEmpty()];
};
module.exports.password = function () {
  return [body("password", "Password is required").exists().not().isEmpty()];
};
module.exports.title = function () {
  return [body("title", "Title is required").exists().not().isEmpty()];
};
module.exports.author = function () {
  return [body("author", "Author is required").exists().not().isEmpty()];
};
module.exports.dateOfPublication = function () {
  return [body("dateOfPublication", "Publication date is required").exists().not().isEmpty()];
};
module.exports.price = function () {
  return [body("price", "Price is required").exists().not().isEmpty()];
};
module.exports.bookId = function () {
  return [body("bookId", "Id of book is required").exists().not().isEmpty()];
};
module.exports.googleToken = function () {
  return [body("googleToken", "googleToken is required").exists().not().isEmpty()];
};
