const express = require('express'),
      bodyParser = require('body-parser'),
      session = require('express-session'),
      cors = require('cors'),
      errorhandler = require('errorhandler'),
      mongoose = require('mongoose');

require('dotenv').config();
const {
  NODE_ENV,
  MONGODB_URI,
  ADMIN_USERNAME,
  EMAIL,
  PASSWORD,
  PORT
} = process.env;

const isProduction = NODE_ENV === 'production';

const app = express();
const use = app.use.bind(app);

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

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

if(isProduction){
  mongoose.connect(MONGODB_URI, mongooseOptions);
} else {
  use(errorhandler());

  mongoose.connect('mongodb://localhost/node-app', mongooseOptions);
  mongoose.set('debug', true);
}

require('./models/User');
require('./config/passport');

use(require('./routes'));

const { createAdmin } = require('./config/seed');
createAdmin(ADMIN_USERNAME, EMAIL, PASSWORD);

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

const server = app.listen( PORT || 3000, () => {
  console.log('Listening on port ' + server.address().port);
});
