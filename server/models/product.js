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


const Product = mongoose.model('Product', ProductSchema);

module.exports = {Product}