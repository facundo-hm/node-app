const jwt = require('express-jwt');
const secret = require('../config').secret;

function getTokenFromHeader (req) {
  const { authorization } = req.headers;

  if (authorization) {
    const auth = authorization.split(' ');

    if (auth[0]  === 'Token' || auth[0] === 'Bearer' ) {
      return auth[1];
    }
  }

  return null;
}

const auth = {
  required: jwt({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
