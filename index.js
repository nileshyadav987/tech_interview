const express = require('express');
const app = express();

const { validationResult } = require("express-validator");

const fu = require("express-fileupload");

const mongoose = require("mongoose");
const Book = require("./models/book");
const User = require("./models/user");
const moment = require("moment");
const axios = require("axios");
require('dotenv').config();

const validate = require("./library/validate");
const { auth } = require("./library/auth");
const fileupload = require("./library/fileupload")


//Sync Database
mongoose.connection.on('connected', function () {
  // Hack the database back to the right one, because when using mongodb+srv as protocol.
  if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
    mongoose.connection.db = mongoose.connection.client.db('test');
  }
  console.log('Connection to MongoDB established.')
});
mongoose.connect("mongodb+srv://nileshyadav987:Ny%4004021990@cluster0.azademi.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fu());
app.use(express.static("public"));

app.get('/', function (req, res) {
  return res.send(`<p>Welcome,</p>

    <p>base URL-&nbsp;<a href="https://frozen-brook-79786.fileupload.com/">https://frozen-brook-79786.fileupload.com/</a></p>

    <p>Postman collection-&nbsp;<a href="https://www.getpostman.com/collections/b780499397ff7c6c2e35">https://www.getpostman.com/collections/b780499397ff7c6c2e35</a></p>
  `);
});

app.get('/logout', [auth], async function (req, res) {
  try {
    await req.user.deleteToken();
    return res.json({ message: "Data updated" });
  } catch (e) {
    return res.status(400).json({ message: e.toString() });
  }
});

app.post('/loginwithgoogle', [validate.googleToken()], async function (req, res) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  } else {
    try {
      var input = req.body;
      var url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + input.googleToken;
      console.log(url);
      var currentUser = await axios.get(url);
      currentUser = currentUser.data;
      // console.log(currentUser.name, currentUser.email, "hfuuh");
      var newuser = await User.findOne({ email: currentUser.email });
      if (newuser == null) {
        newuser = new User({
          name: currentUser.name,
          email: currentUser.email
        });
        await newuser.save();
      }
      await newuser.generateToken();
      return res.json({ main: { user: newuser }, message: "Data updated" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: e.toString() });
    }
  }
});

app.delete('/deletebook', [validate.bookId()], async function (req, res) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  } else {
    try {
      var input = req.body;
      var mybook = await Book.findById(input.bookId);

      if (Boolean(mybook.image))
        await fileupload.remove(
          __dirname + process.env.IMAGE_PATH,
          mybook.image.split("/")[2]
        );
      await mybook.delete();
      return res.json({ main: {}, message: "Data deleted" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: e.toString() });
    }
  }
});

app.get('/fetchbooks', [], async function (req, res) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  } else {
    try {
      var input = req.query;
      var allbooks = [];
      if (Boolean(input.bookId)) {
        allbooks = await Book.find({ _id: input.bookId });
      } else {
        allbooks = await Book.find();
      }
      return res.json({ main: { allbooks, count: allbooks.length }, message: "Data fetched" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: e.toString() });
    }
  }
});

app.get('/fetchusers', [], async function (req, res) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  } else {
    try {
      var input = req.query;
      var allusers = [];
      if (Boolean(input.userId)) {
        allusers = await User.find({ _id: input.userId });
      } else {
        allusers = await User.find();
      }
      return res.json({ main: { allusers, count: allusers.length }, message: "Data fetched" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: e.toString() });
    }
  }
});

app.put('/editbook', [validate.bookId(), validate.title(), validate.author(), validate.dateOfPublication(), validate.price()], async function (req, res) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  } else {
    try {
      var input = req.body;
      var mybook = await Book.findById(input.bookId);
      if (mybook == null) throw new Error("Book not found");
      mybook.title = input.title;
      mybook.author = input.author;
      mybook.price = input.price;
      mybook.chapters = Boolean(input.chapters) ? input.chapters.split(",") : [];
      mybook.dateOfPublication = moment(input.dateOfPublication, "DD/MM/YYYY").toDate();


      if (process.env.fileupload == "yes" && Boolean(req.files) && Boolean(req.files.image)) {
        mybook.image = await fileupload.upload(
          req.files.image,
          __dirname + process.env.IMAGE_PATH,
          mybook.image ? mybook.image.split("/")[2] : null
        );
      }
      await mybook.save();
      return res.json({ main: { mybook }, message: "Data updated successfully" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: e.toString() });
    }
  }
});

app.post('/addbook', [validate.title(), validate.author(), validate.dateOfPublication(), validate.price()], async function (req, res) {
  console.log("kfkfk", req.body);
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  } else {
    try {
      var input = req.body;

      var newbook = new Book({
        title: input.title,
        author: input.author,
        price: input.price,
        chapters: Boolean(input.chapters) ? input.chapters.split(",") : [],
        dateOfPublication: moment(input.dateOfPublication, "DD/MM/YYYY").toDate()
      });
      console.log(process.env.fileupload, "hhfhf");
      if (process.env.fileupload == "yes" && Boolean(req.files) && Boolean(req.files.image)) {
        newbook.image = await fileupload.upload(
          req.files.image,
          __dirname + process.env.IMAGE_PATH
        );
      }
      await newbook.save();
      return res.json({ main: { newbook }, message: "Data inserted successfully" });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: e.toString() });
    }
  }
});

var server = app.listen(process.env.PORT || 3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});