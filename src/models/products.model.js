const mongoose = require('mongoose');

const userCollection = 'products'

const chatSchema = new mongoose.Schema({
  product: {
    type: String,
    unique: true,
    required: true,
  },
  price: {
    type: String,
    required: true,
  }
});

const Products = mongoose.model(userCollection, chatSchema);

module.exports = Products;
