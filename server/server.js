require('./config/config');

const _ = require('lodash');
const express = require('express');
const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Product } = require('./models/product');
const { Order } = require('./models/order');
const { OrderUser } = require('./models/orderuser');

const env = process.env.NODE_ENV || 'development';

const { authenticate } = require('./middleware/authenticate');
const { authenticateAsAdmin } = require('./middleware/authenticate-as-admin');

const app = express();
const port = 8081;

const apiBase = '/shopeluska-api/'

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Will be removed start */

app.get(apiBase + 'addadmin', (req, res) => {
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

app.get(apiBase + 'addtest', (req, res) => {
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

app.get(apiBase + 'getinfo', (req, res) => {
    console.log('here');
    res.send('sdfs');

});



/* Will be removed end */

///////////////////////////////////////////////////////////////////////

// ---------------------- USER OPERATIONS ---------------------- //

///////////////////////////////////////////////////////////////////////

app.post(apiBase + 'users', authenticateAsAdmin, (req, res) => {
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



app.get(apiBase + 'users/:id', authenticateAsAdmin, (req, res) => {
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

app.post(apiBase + 'users/updateMyProfile', authenticate, (req, res) => {
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



app.post(apiBase + 'login', (req, res) => {
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



app.get(apiBase + 'logout', (req, res) => {
    res.clearCookie('sessionCid');
    res.status(200).send();
});




app.get(apiBase + 'checkLogin', (req, res) => {
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


app.post(apiBase + 'products', authenticateAsAdmin, (req, res) => {
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

app.get(apiBase + 'products', (req, res) => {
    Product.find().then((products) => {
        res.send(products);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch(apiBase + 'products', authenticateAsAdmin, (req, res) => {
    const id = req.body._id;
    Product.findOneAndUpdate({ _id: id }, {
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

app.delete(apiBase + 'products/:id', authenticateAsAdmin, (req, res) => {
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

///////////////////////////////////////////////////////////////////////

// ---------------------- ORDER OPERATIONS ---------------------- //

///////////////////////////////////////////////////////////////////////

app.post(apiBase + 'orders', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;
        const userOrder = new OrderUser({
            user: userId
        });

        const orderUser = await userOrder.save();

        const items = req.body.items;

        for (let item of items) {
            const product = await Product.findOne({_id: item.product._id}).select('price');
            const createdOrder = new Order({
                orderUser: orderUser._id,
                product: product._id,
                quantity: item.quantity,
                orderPrice: product.price * item.quantity
            });
            await createdOrder.save();
        }

        res.send(orderUser);

    } catch (err) {
        res.status(500).send(err);
    }
});

app.get(apiBase + 'orders/user/:id', authenticate, async (req, res) => {
    try {
        const user = req.user;
        if (user._id === req.params.id || user.isAdmin) {
            const userOrders = await OrderUser.find({ user: req.params.id });
            const allOrders = [];
            for (let orderUser of userOrders) {
                const orders = await Order.find({
                    orderUser
                }).populate('product', 'name price imageUrl');
                allOrders.push({ orderUser, orders })
            }
            res.send({ allOrders });
        } else {
            res.status(400).send('Opss.. Does not have permission.');
        }

    } catch (err) {
        res.status(500).send(err);
    }
});


const loadTestData = async () => {
    const user = new User({
        _id: '5db6b24830f133b65dbbe457',
        email: 'admin@test.com',
        password: '123456',
        isAdmin: true,
        name: 'admin'
    });

    const user2 = new User({
        _id: '5db6b24830f133b65dbbe467',
        email: 'user@test.com',
        password: '123456',
        isAdmin: true,
        name: 'user'
    });

    const product = new Product({
        _id: '5db6b24830f133b65dbbe458',
        name: 'Test2 Product',
        price: 15.5,
        stock: 5,
        category: 'shoes',
        imageUrl: '',
        rate: 0,
        description: 'A test starter project'
    });

    const product2 = new Product({
        _id: '5db6b24830f133b65dbbe468',
        name: 'Test3 Product',
        price: 25.5,
        stock: 7,
        category: 'shoes',
        imageUrl: '',
        rate: 0,
        description: 'Another test starter project'
    });

    const orderUser = new OrderUser({
        "_id" : '5ef8709b255106223cfb2689',
        "user" :'5db6b24830f133b65dbbe457',
        "createdAt" : 1593340059945.0
    });

    const orderUser2 = new OrderUser({
        "_id" : '5ef8709b255106223cfb2699',
        "user" :'5db6b24830f133b65dbbe467',
        "createdAt" : 1593340059946.0
    });

    const order = new Order({
        "_id" : '5ef8709c255106223cfb268a',
        "orderUser" : '5ef8709b255106223cfb2689',
        "product" : '5db6b24830f133b65dbbe458',
        "quantity" : 2,
        "orderPrice" : 47.5,
        "createdAt" : 1593340060002.0
    });

    const order2 = new Order({
        "_id" : '5ef8709c255106223cfb269a',
        "orderUser" : '5ef8709b255106223cfb2699',
        "product" : '5db6b24830f133b65dbbe468',
        "quantity" : 3,
        "orderPrice" : 37.5,
        "createdAt" : 1593340060003.0
    });

    try {

        await User.deleteMany();
        await Product.deleteMany();
        await OrderUser.deleteMany();
        await Order.deleteMany();

        await user.save();
        await product.save();
        await orderUser.save();
        await order.save();

        await user2.save();
        await product2.save();
        await orderUser2.save();
        await order2.save();

    } catch (e) {
       console.log(e);
    }
}

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
    if (env === 'test') {
        loadTestData();
    }
});