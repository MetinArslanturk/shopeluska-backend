const mongoose = require('mongoose');
const _ = require('lodash');


var ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number
  },
  imageUrl: {
    type: String
  },
  rate: {
    type: Number
  },
  category: {
    type: String
  },
  createdAt: {
    type: Number,
    default: Date.now()
  },
  description: {
    type: String
  }
});


ProductSchema.virtual('key').get(function(){
  return this._id.toHexString();
});


ProductSchema.set('toObject', {
  virtuals: true
});

ProductSchema.methods.toJSON = function () {
  const product = this;
  const productObject = product.toObject();
  return _.pick(productObject, ['_id', 'name', 'description', 'category', 'rate', 'price', 'stock', 'imageUrl', 'createdAt', 'key']);
};


const Product = mongoose.model('Product', ProductSchema);

module.exports = {Product}