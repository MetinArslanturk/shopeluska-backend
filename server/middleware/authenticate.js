const {User} = require('./../models/user');

const authenticate = (req, res, next) => {
  var token = null;
  if(req.cookies && req.cookies.sessionCid){
   token = req.cookies.sessionCid;
   } else {
    res.status(401).send();
    return;
  }

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    req.user = user;
    next();
  }).catch((e) => {
    res.status(401).send();
  });

};

module.exports = {authenticate};