const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI,  { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {mongoose};
