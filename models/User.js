const mongoose = require('mongoose'),
      uniqueValidator = require('mongoose-unique-validator'),
      crypto = require('crypto'),
      jwt = require('jsonwebtoken'),
      secret = require('../config').secret;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'Should be defined'],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'Should be defined'],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  hash: String,
  salt: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'already exists.' });

const methods = {
  validPassword: function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');

    return this.hash === hash;
  },

  setPassword: function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  },

  generateJWT: function () {
    const today = new Date();
    const exp = new Date(today);
  
    exp.setDate(today.getDate() + 60);
  
    return jwt.sign({
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  },

  toAuthJSON: function () {
    return {
      username: this.username,
      email: this.email,
      token: this.generateJWT()
    };
  },

  toProfileJSONFor = function (user) {
    return {
      username: this.username
    };
  }
};

UserSchema.method(methods);

mongoose.model('User', UserSchema);
