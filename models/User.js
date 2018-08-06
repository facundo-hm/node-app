const mongoose = require('mongoose'),
      uniqueValidator = require('mongoose-unique-validator'),
      crypto = require('crypto'),
      jwt = require('jsonwebtoken'),
      secret = require('../config').secret;

class UserSchema extends mongoose.Schema {
  constructor(schema, options) {
    const userSchema = Object.assign({
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
      type: {
        type: String,
        lowercase: true,
        required: [true, 'Should be defined'],
        index: true
      },
      hash: String,
      salt: String
    }, schema);
  
    const userOptions = Object.assign({ timestamps: true }, options);

    super(userSchema, userOptions);

    this.plugin(uniqueValidator, { message: 'already exists.' });

    this.method({
      validPassword: this.validPassword,
      setPassword: this.setPassword,
      generateJWT: this.generateJWT,
      toAuthJSON: this.toAuthJSON,
      toProfileJSONFor: this.toProfileJSONFor
    });
  }

  validPassword (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');

    return this.hash === hash;
  }

  setPassword (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  generateJWT () {
    const today = new Date();
    const exp = new Date(today);
  
    exp.setDate(today.getDate() + 60);
  
    return jwt.sign({
      id: this._id,
      username: this.username,
      type: this.type,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  }

  toAuthJSON () {
    return {
      username: this.username,
      email: this.email,
      token: this.generateJWT()
    };
  }

  toProfileJSONFor (user) {
    return {
      username: this.username
    };
  }
}

const User = new UserSchema();

mongoose.model('User', User);
