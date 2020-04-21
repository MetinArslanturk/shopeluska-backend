require('./config/config');

const _ = require('lodash');
const express = require('express');
const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Product } = require('./models/product');


const { authenticate } = require('./middleware/authenticate');
const { authenticateAsAdmin } = require('./middleware/authenticate-as-admin');

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

app.get('/api/addtest', (req, res) => {
    const user = new User({
        email: 'testn@test.com',
        password: '123456',
        isAdmin: false,
        name: 'test'
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
        if (user) {
            res.send(user);
        } else {
            res.status(400).send('Could not find the user.');
        } 
    }, (err) => {
        res.status(500).send(err);
    });
});

app.post('/api/users/updateMyProfile', authenticate, (req, res) => {
    const userId = req.user._id;
    User.findOneAndUpdate({
        _id: userId
    }, {
        ...(req.body.email && { email: req.body.email }),
        ...(req.body.password && { password: req.body.password }),
        ...(req.body.username && { name: req.body.username })
    }, { new: true }).then((usr) => {
        if (usr) {
            res.send(usr);
        } else {
            res.status(400).send('Could not find the user.');
        } 
    });
});



app.post('/api/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.cookie('sessionCid', token, { maxAge: 86400000, httpOnly: true });
            res.status(200).send({ isA: user.isAdmin, name: user.name, _id: user._id, email: user.email });
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
        res.status(200).send({ caut: false });
        return;
    }

    User.findByToken(token).then((user) => {
        if (!user) {
            res.status(200).send({ caut: false });
            return;
        }
        res.status(200).send({ caut: true, isA: user.isAdmin, name: user.name, _id: user._id, email: user.email });
        return;
    }).catch((e) => {
        res.status(200).send({ caut: false });
        return;
    });
});


///////////////////////////////////////////////////////////////////////

// ---------------------- PRODUCT OPERATIONS ---------------------- //

///////////////////////////////////////////////////////////////////////


app.post('/api/products', authenticateAsAdmin, (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
        rate: 0,
        description: req.body.description
    });

    product.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/api/products', (req, res) => {
    Product.find().then((products) => {
        res.send(products);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch('/api/products', authenticateAsAdmin, (req, res) => {
    const id = req.body._id;
    Product.findOneAndUpdate({_id: id}, {
        ...(req.body.name && { name: req.body.name }),
        ...(req.body.description && { description: req.body.description }),
        ...(req.body.imageUrl && { imageUrl: req.body.imageUrl }),
        ...(req.body.stock && { stock: req.body.stock }),
        ...(req.body.category && { category: req.body.category }),
        ...(req.body.price && { price: req.body.price })
    }, { new: true }).then((prd) => {
        if (prd) {
            res.send(prd);
        } else {
            res.status(400).send(e);
        }
    }, (e) => {
        res.status(400).send(e);
    }).catch(err => {
        res.status(400).send(err);
    })
});

app.delete('/api/products/:id', authenticateAsAdmin, (req, res) => {
    const id = req.params.id;
    Product.findOneAndDelete({ _id: id }).then((doc) => {
        if (doc) {
            res.send();
        } else {
            res.status(400).send('Could not find product');
        }
    }, (err) => {
        res.status(500).send(err);
    });
})


app.listen(port, () => {
    console.log(`Started up at port ${port}`);
});