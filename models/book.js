const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('dotenv').config();

let BookSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, default: '' },
  author: { type: String, default: '' },
  dateOfPublication: { type: Date, default: null },
  chapters: { type: [], default: [] },
  price: { type: Number, required: true }
});

BookSchema.path("image").get(function (v) {
  return v ? process.env.IMAGE_URL + v : "";
});

BookSchema.set("toJSON", { getters: true, virtuals: true });

module.exports = mongoose.model('Book', BookSchema);