const mongoose = require('mongoose');
const _ = require('lodash');

const Schema = mongoose.Schema;

const OrderUserSchema = new Schema({
  user : {
    type: Schema.Types.ObjectId,
    ref: 'User' 
  },
  createdAt: {
    type: Number,
    default: Date.now
  }
});



OrderUserSchema.methods.toJSON = function () {
  const order = this;
  const orderObject = order.toObject();
  return _.pick(orderObject, ['_id', 'user', 'createdAt']);
};


const OrderUser = mongoose.model('OrderUser', OrderUserSchema);

module.exports = {OrderUser}