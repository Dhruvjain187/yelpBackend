const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync")
const User = require('../models/user');
const ExpressError = require('../utils/ExpressError');
const { verifyJwt } = require("../middleware/auth")
const jwt = require("jsonwebtoken")
const users = require("../controllers/users")
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     // host: "smtp.ethereal.email",
//     // port: 587,
//     // secure: false, // true for port 465, false for other ports
//     service: "gmail",
//     secure: true,
//     port: 465,
//     auth: {
//         user: "dhruvjain8834@gmail.com",
//         pass: "rnyjxospamrkheob",
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// const generateAccessAndRefereshTokens = async (userId) => {
//     try {
//         const user = await User.findById(userId)
//         console.log("hey")
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken();
//         console.log("access & refresh", accessToken, refreshToken)

//         user.refreshToken = refreshToken
//         await user.save()

//         return { accessToken, refreshToken }


//     } catch (error) {
//         throw new ExpressError("Something went wrong while generating referesh and access token", 500)
//     }
// }

// router.post('/register', catchAsync(async (req, res, next) => {
//     try {
//         const { email, username, password } = req.body;
//         const user = new User({ email, username });
//         const registeredUser = await User.register(user, password);
//         req.login(registeredUser, err => {
//             if (err) return next(err);
//             req.flash('success', 'Welcome to Yelp Camp!');
//             res.redirect('/campgrounds');
//         })
//     } catch (e) {
//         req.flash('error', e.message);
//         res.redirect('register');
//     }
// }));

// router.post('/register', catchAsync(async (req, res, next) => {
//     const { email, username, password } = req.body;
//     const existedUser = await User.findOne({ $or: [{ username }, { email }] })
//     if (existedUser) {
//         throw new ExpressError("User with email or username already exist", 409)
//     }

//     const user = await User.create({ email, username, password });
//     await user.save();
//     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
//     console.log(accessToken, refreshToken)
//     const options = {
//         httpOnly: true,
//         secure: false
//     }

//     const createdUser = await User.findById(user._id).select("-refreshToken");

//     if (!createdUser) {
//         throw new ExpressError("something went wrong while registering the user", 500)
//     }

//     await transporter.sendMail({
//         from: '"Nodemailer Contact 👻" <dhruvjain8834@gmail.com>', // sender address
//         to: `${createdUser.email}`, // list of receivers
//         subject: "Node Contact Request", // Subject line
//         text: "Hello world?", // plain text body
//         html: "Thanks for registering in yelpcamp hope you enjoy surfing here", // html body
//     }, (error, info) => {
//         if (error) {
//             return console.log(error)
//         }
//         console.log("Message sent:", info.messageId)
//         console.log("Preview URL:", nodemailer.getTestMessageUrl(info))
//     });

//     res.status(201)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(createdUser)
// }));

// router.get('/login', (req, res) => {
//     res.render('users/login');
// })

// router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
//     req.flash('success', 'welcome back!');
//     const redirectUrl = req.session.returnTo || '/campgrounds';
//     delete req.session.returnTo;
//     res.redirect(redirectUrl);
// })

router.post('/register', catchAsync(users.register))

// router.post('/login', catchAsync(async (req, res) => {
//     // req.flash('success', 'welcome back!');
//     // const redirectUrl = req.session.returnTo || '/campgrounds';
//     // delete req.session.returnTo;
//     // res.redirect(redirectUrl);
//     const { username, password } = req.body

//     if (!username && !password) {
//         throw new ExpressError("username and password  is required", 400)
//     }

//     const user = await User.findOne({
//         username
//     })

//     if (!user) {
//         throw new ExpressError("User does not exist", 404)
//     }

//     const isPasswordValid = await user.isPasswordCorrect(password)

//     if (!isPasswordValid) {
//         throw new ExpressError("Invalid user credentials", 401)
//     }


//     const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//     const options = {
//         httpOnly: true,
//         secure: false
//     }

//     return res
//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .send(
//             {
//                 user: loggedInUser, accessToken, refreshToken
//             }
//         )
// }))

router.post('/login', catchAsync(users.login))

// router.post('/logout', verifyJwt, catchAsync(async (req, res) => {
//     await User.findByIdAndUpdate(req.user._id, {
//         $set: {
//             refreshToken: undefined
//         }
//     }, {
//         new: true
//     })

//     const options = {
//         httpOnly: true,
//         secure: false
//     }

//     return res.status(200)
//         .clearCookie("refreshToken", options)
//         .clearCookie("accessToken", options)
//         .send("User Logged Out")
// }))

router.post('/logout', verifyJwt, catchAsync(users.logout))

// router.post('/refreshtoken', catchAsync(async (req, res) => {
//     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
//     // console.log(incomingRefreshToken)
//     if (!incomingRefreshToken) {
//         throw new ExpressError("Unauthorized request", 401)
//     }

//     try {
//         const decodedToken = jwt.verify(incomingRefreshToken, process.env.RefreshTokenSecret);

//         const user = await User.findById(decodedToken?._id)
//         // console.log(user)

//         if (!user) {
//             throw new ExpressError("Invalid refresh token", 401)
//         }

//         if (incomingRefreshToken !== user?.refreshToken) {
//             throw new ExpressError("Refresh token is expired or used", 401)
//         }

//         const options = {
//             httpOnly: true,
//             secure: false
//         }

//         const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
//         // console.log(accessToken, refreshToken)
//         return res.status(200)
//             .cookie("accessToken", accessToken, options)
//             .cookie("refreshToken", refreshToken, options)
//             .json({ accessToken, refreshToken })
//     } catch (error) {
//         throw new ExpressError(error?.message || "invalid refresh token", 401)
//     }
// }))

router.post('/refreshtoken', catchAsync(users.refreshtoken))


module.exports = router;