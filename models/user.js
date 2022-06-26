require('dotenv').config();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { encrypt, decrypt } = require('./cipher');
const jwt = require('jsonwebtoken');

let UserSchema = new Schema(
  {
    name: String,
    email: { type: String, set: encrypt, get: decrypt, unique: true },
    token: String,
  },

  {
    versionKey: false,

    // Following options will enable us to use getters and setters on almost all queries
    toObject: { getters: true, setters: true },
    toJSON: { getters: true, setters: true },
    runSettersOnQuery: true,
  }
);

UserSchema.methods.generateToken = function () {
  var user = this;
  return new Promise(function (resolve, reject) {

    var token = jwt.sign({ _id: user._id }, process.env.IV_STRING);
    user.token = token;
    user.save(function (err, user) {
      if (err) return reject(err);
      resolve(user);
    });
  })
}

UserSchema.methods.deleteToken = function () {
  var user = this;
  return new Promise(function (resolve, reject) {
    user.token = null;
    user.save(function (err, user) {
      if (err) return reject(err);
      resolve(user);
    });
  })
}

// find by token
UserSchema.statics.findByToken = function (token, cb) {
  var user = this;
  jwt.verify(token, process.env.IV_STRING, function (err, decode) {
    console.log(decode, "hh7");
    user.findOne({ "_id": decode, "token": token }, function (err, user) {
      if (err) return cb(err, null);
      cb(null, user);
    })
  });
};

module.exports = mongoose.model('User', UserSchema);