const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    const { name, email, password } = req.body;
    const destinationEmail = req.body.email;

    let newUser = new User({ name, email, password });
    newUser.save((err, success) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      res.json({
        message: "Signup success! Please signin.",
      });
    });

    console.log("called");

    const outputtexture =
      `<div class="container">
        <div class="box">
            <i class="fas fa-play fa-color"></i>
            <h1>Stream tube</h1>
        </div>
        <div class="box">
            <img class="center-img" src="https://i.ibb.co/zZZSvzk/1111.jpg" alt="1111">
        </div>
        <div class="box">
            <h2>Thank you for registering</h2>
        </div>
        <hr>
    </div>
         `;
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'agranjithsnadarajan@gmail.com',
        pass: 'ranjithnadarajan'
      }
    });


    var mailOptions = {
      from: '"Stream Tube" swampfire1728@gmail.com',
      to: [],
      bcc: destinationEmail,
      subject: 'StremTube',
      text: "Welcome",
      html: outputtexture
    };

    transporter.sendMail(mailOptions, function (error, info) {
      console.log("mail" + destinationEmail);
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup.",
      });
    }

    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match.",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "876543567687987675645657898765455687980978675643465768798d",
    });

    res.cookie("token", token, {
      expiresIn: "876543567687987675645657898765455687980978675643465768798d",
    });
    const { _id, name, email } = user;
    return res.json({
      token,
      user: { _id, name, email },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout success",
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
});

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};
