const { User } = require('../models/user');
const { Product } = require('../models/product');
const { Order } = require('../models/order');
const { OrderUser } = require('../models/orderuser');

const makeReadyTestData = async () => {
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

module.exports = { makeReadyTestData };