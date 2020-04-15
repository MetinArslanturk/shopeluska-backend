const mongoose = require('mongoose');


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
  rate: {
    type: Number
  },
  description: {
    type: String
  }
});

ProductSchema.virtual('key').get(function(){
  return this._id.toHexString();
});


ProductSchema.set('toJSON', {
  virtuals: true
});


const Product = mongoose.model('Product', ProductSchema);

module.exports = {Product}