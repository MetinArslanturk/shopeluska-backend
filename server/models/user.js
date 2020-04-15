const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    require: true,
    default: false
  },
  token: {
    type: String,
    default: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
});

UserSchema.virtual('key').get(function(){
  return this._id.toHexString();
});


UserSchema.set('toObject', {
  virtuals: true
});

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  return _.pick(userObject, ['_id', 'name', 'email', 'isAdmin', 'key']);
};



UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, '256@mhKjNqq65z!Td,').toString();

  user.token = token;

  return user.save().then(() => {
    return token;
  });
};


UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, '256@mhKjNqq65z!Td,');
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'token': token
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.pre('findOneAndUpdate', function (next) {
  let pass = this.getUpdate().password;
  if (pass !== '' && pass !== undefined && pass !== null) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(pass, salt, (err, hash) => {
        this.getUpdate().password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User}
