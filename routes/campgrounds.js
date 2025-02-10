const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require("../controllers/campgrounds")
const Campground = require("../models/camground")
const { verifyJwt, validateCampground, isAuthor } = require("../middleware/auth")
const { storage } = require("../cloudinary");
const multer = require("multer")
const upload = multer({ storage })
// const validateCampground = (req, res, next) => {
//     const { error } = campgroundSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next();
//     }
// }

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(upload.array("image"), verifyJwt, validateCampground, catchAsync(campgrounds.createCampground))

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(upload.array("image"), verifyJwt, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(verifyJwt, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit", verifyJwt, catchAsync(campgrounds.EditForm))

// router.get('/', async (req, res) => {
//     const campgrounds = await Campground.find({})
//     // console.log(process.env.AccessTokenExpires)
//     res.send(campgrounds)
// });


// router.post('/', verifyJwt, validateCampground, catchAsync(
//     async (req, res) => {
//         console.log("post")
//         const campground = new Campground(req.body.campground);
//         campground.author = req.user._id;
//         console.log(campground)
//         await campground.save();
//         res.status(201).send("campground is created")
//     }
// ))


// router.get('/:id', async (req, res,) => {
//     // const campground = await Campground.findById(req.params.id).populate('reviews');
//     const campground = await Campground.findById(req.params.id).populate({
//         path: 'reviews',
//         populate: {
//             path: 'author'
//         }
//     })
//     res.send(campground);
// });

// router.get('/:id/edit', async (req, res) => {
//     const campground = await Campground.findById(req.params.id)
//     res.send(campground);
// })

// router.put('/:id', verifyJwt, isAuthor, validateCampground, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     res.status(200).send(campground._id)
// }));

// router.delete('/:id', verifyJwt, isAuthor, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.send("campground deleted")
// }))

module.exports = router;