const User = require("../models/user")
const jwt = require("jsonwebtoken")
const ExpressError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/camground")
const Review = require("../models/review")
const { campgroundSchema, reviewSchema } = require("../schemas")

module.exports.verifyJwt = catchAsync(async (req, res, next) => {
    // console.log("body=", req.body.campground)
    // console.log(req.cookies)
    // console.log(req.files)
    // console.log(req.body.deleteImages)
    try {
        const token = req.cookies?.accessToken
        if (!token) {
            throw new ExpressError("Unauthorized request", 401)
        }

        const decodedToken = await jwt.verify(token, process.env.AccessTokenSecret);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ExpressError("Invalid Access Token", 401)
        }

        req.user = user;
        // console.log("all done here")
        next()
    } catch (error) {
        // console.log("is it here")
        throw new ExpressError(error?.message || "invalid access token", 401)
    }
})


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    // console.log(error)
    if (error) {
        // console.log("error due to here")
        const msg = error.details.map(el => el.message).join(',')
        console.log("msg=", msg)
        throw new ExpressError(msg, 400)
    } else {
        // console.log("next")
        next();
    }
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // console.log("camp=", campground)
    if (!campground.author.equals(req.user._id)) {
        return res.status(403).send("You do not have permission to do that!")
    }
    // console.log("next delete")
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        // req.flash('error', 'You do not have permission to do that!');
        // return res.redirect(`/campgrounds/${id}`);

        res.status(403).send("You do not have permission to do that!")
    }
    next();
}