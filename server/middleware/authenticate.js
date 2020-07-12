const { User } = require("../models/user");
const env = process.env.NODE_ENV || "development";

const authenticate = (req, res, next) => {
  if (env === "test") {
    req.user = {
      _id: "5db6b24830f133b65dbbe457",
      name: "admin",
      email: "admin@test.com",
      password: "123456",
      isAdmin: true,
    };
    next();
  } else {
    let token = null;
    if (req.cookies && req.cookies.sessionCid) {
      token = req.cookies.sessionCid;
    } else {
      res.status(401).send();
      return;
    }

    User.findByToken(token)
      .then((user) => {
        if (!user) {
          return Promise.reject();
        }

        req.user = user;
        next();
      })
      .catch((e) => {
        res.status(401).send();
      });
  }
};

module.exports = { authenticate };
