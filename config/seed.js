const mongoose = require('mongoose');
const User = mongoose.model('User');

const createAdmin = (username, email, password) => {
  const user = new User();

  user.username = username || 'Admin';
  user.email = email || 'admin@gmail.com';
  user.setPassword(password || '1234');
  user.type = 'admin';

  user.save()
    .then(() => console.log('Admin user has been created'))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        console.log('Error when creating Admin User');

        Object.keys(err.errors).forEach((errKey) => {
          console.log(`${ errKey }: ${ err.errors[errKey].message }`)
        });
      } else {
        console.log(err)
      }
    });
}

module.exports = {
  createAdmin
}
