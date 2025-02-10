const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require("../models/camground")
const Review = require("../models/review")
const { verifyJwt, validateReview, isReviewAuthor } = require("../middleware/auth")
const reviews = require("../controllers/reviews");

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');



// router.post('/', verifyJwt, validateReview, catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     // res.redirect(`/campgrounds/${campground._id}`);
//     res.status(201).send(campground._id)
// }))

router.post("/", verifyJwt, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewId", verifyJwt, isReviewAuthor, catchAsync(reviews.deleteReview))

// router.post('/', verifyJwt, validateReview, catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     review.author = req.user._id;
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     // res.redirect(`/campgrounds/${campground._id}`);
//     res.status(201).send(campground._id)
// }))

// router.delete('/:reviewId', verifyJwt, isReviewAuthor, catchAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);
//     // res.redirect(`/campgrounds/${id}`);
//     res.status(200).send(id)
// }))

module.exports = router