const http = require('http'),
      path = require('path'),
      methods = require('methods'),
      express = require('express'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      cors = require('cors'),
      passport = require('passport'),
      errorhandler = require('errorhandler'),
      mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();
const { use, listen } = app;

use(cors());

// Express config
use(require('morgan')('dev'));

use(bodyParser.urlencoded({ extended: false }));

use(bodyParser.json());

use(require('method-override')());

use(express.static(__dirname + '/public'));

use(session({
  secret: 'node-app',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false 
}));

if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  use(errorhandler());

  mongoose.connect('mongodb://localhost/node-app');
  mongoose.set('debug', true);
}

require('./models/User');

use(require('./routes'));

// Catch 404
use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Dev error handler
if (!isProduction) {
  use((err, req, res, next) => {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// Prod error handler
use((err, req, res, next) => {
  res.status(err.status || 500);

  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

const server = listen( process.env.PORT || 3000, () => {
  console.log('Listening on port ' + server.address().port);
});