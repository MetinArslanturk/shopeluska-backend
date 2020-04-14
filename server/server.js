require('./config/config');

const _ = require('lodash');
const express = require('express');
const axios = require('axios');
const os = require('os');
const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Product } = require('./models/product');


const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = 8081;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Will be removed start */

app.get('/api/addadmin', (req, res) => {
    const user = new User({
        email: 'admin@test.com',
        password: '123456',
        isAdmin: true,
        name: 'admin'
    });

    user.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/api/getinfo', (req, res) => {
    console.log('here');
        res.send('sdfs');

});



/* Will be removed end */

///////////////////////////////////////////////////////////////////////

// ---------------------- USER OPERATIONS ---------------------- //

///////////////////////////////////////////////////////////////////////

app.post('/api/users', authenticate, (req, res) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        ...(typeof req.body.isAdmin === "boolean" && { isAdmin: req.body.isAdmin }),
        ...(typeof req.body.name === "string" && { name: req.body.name })
    });

    user.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});



app.get('/api/users/:id', authenticate, (req, res) => {
    User.findOne({
        _id: req.params.id
    }).then((user) => {
        res.send(user);
    }, (err) => {
        res.status(500).send(err);
    });
});



app.post('/api/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.cookie('sessionCid', token, { maxAge: 86400000, httpOnly: true });
            res.status(200).send({ isA: user.isAdmin, name: user.name, id: user._id });
        });
    }).catch((e) => {
        res.status(403).send();
    });
});



app.get('/api/logout', (req, res) => {
    res.clearCookie('sessionCid');
    res.status(200).send();
});




app.get('/api/checkLogin', (req, res) => {
    let token = null;
    if (req.cookies && req.cookies.sessionCid) {
        token = req.cookies.sessionCid;
    } else {
        res.status(200).send({caut: false});
        return;
    }

    User.findByToken(token).then((user) => {
        if (!user) {
            res.status(200).send({caut: false});
            return;
        }

        res.status(200).send({caut: true, isA: user.isAdmin, name: user.name, id: user._id});
        return;
    }).catch((e) => {
        res.status(200).send({caut: false});
        return;
    });
});


///////////////////////////////////////////////////////////////////////

// ---------------------- PRODUCT OPERATIONS ---------------------- //

///////////////////////////////////////////////////////////////////////




app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});