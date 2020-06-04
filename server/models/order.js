const mongoose = require('mongoose');
const _ = require('lodash');

var Schema = mongoose.Schema;

var OrderSchema = new Schema({
  orderUser : {
    type: Schema.Types.ObjectId,
    ref: 'OrderUser' 
  },
  product : {
    type: Schema.Types.ObjectId,
    ref: 'Product' 
  },
  quantity: {
    type: Number,
    required: true
  },
  orderPrice: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
});


OrderSchema.virtual('key').get(function(){
  return this._id.toHexString();
});


OrderSchema.set('toObject', {
  virtuals: true
});

OrderSchema.methods.toJSON = function () {
  const product = this;
  const productObject = product.toObject();
  return _.pick(productObject, ['_id', 'orderUser', 'product', 'quantity', 'orderPrice', 'createdAt', 'key']);
};


const Order = mongoose.model('Order', OrderSchema);

module.exports = {Order}