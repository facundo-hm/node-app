const mongoose = require('mongoose'),
      router = require('express').Router(),
      passport = require('passport'),
      User = mongoose.model('User'),
      auth = require('../auth');

const { get, put, post } = router;
const { required } = auth;

get('/user', required, (req, res, next) => {
  User.findById(req.payload.id).then((user) => {
    if (!user) {
      return res.sendStatus(401);
    }

    return res.json({ user: user.toAuthJSON() });
  }).catch(next);
});

put('/user', required, (req, res, next) => {
  const { username, email, password } = req.body.user;

  User.findById(req.payload.id).then((user) => {
    if (!user) {
      return res.sendStatus(401);
    }

    if (typeof username !== 'undefined') {
      user.username = username;
    }

    if (typeof email !== 'undefined') {
      user.email = email;
    }

    if (typeof password !== 'undefined') {
      user.setPassword(password);
    }

    return user.save().then(() => {
      return res.json({ user: user.toAuthJSON() });
    });
  }).catch(next);
});

post('/users/login', (req, res, next) => {
  const message = 'Should be defined';
  const { email, password } = req.body.user;
  const { status } = res;

  if (!email) {
    return status(422).json({ errors: { email: message } });
  }

  if (!password) {
    return status(422).json({ errors: { password: message } });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (user) {
      user.token = user.generateJWT();

      return res.json({user: user.toAuthJSON()});
    } else {
      return status(422).json(info);
    }
  })(req, res, next);
});

post('/users', (req, res, next) => {
  const user = new User();
  const { username, email, password } = req.body.user;

  user.username = username;
  user.email = email;
  user.setPassword(password);

  user.save().then(() => {
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

module.exports = router;
