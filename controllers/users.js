const User = require("../models/user")
const transporter = require("../config/nodemailercongig")
const generateAccessAndRefereshTokens = require("../utils/tokens")
const ExpressError = require("../utils/ExpressError")
const jwt = require("jsonwebtoken")

module.exports.register = async (req, res, next) => {
    const { email, username, password } = req.body;
    const existedUser = await User.findOne({ $or: [{ username }, { email }] })
    if (existedUser) {
        throw new ExpressError("User with email or username already exist", 409)
    }

    const user = await User.create({ email, username, password });
    await user.save();
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
    console.log(accessToken, refreshToken)
    const options = {
        httpOnly: true,
        secure: true
    }

    const createdUser = await User.findById(user._id).select("-refreshToken");

    if (!createdUser) {
        throw new ExpressError("something went wrong while registering the user", 500)
    }

    await transporter.sendMail({
        from: `"Nodemailer Contact 👻" <${process.env.NodemailerUser}>`, // sender address
        to: `${createdUser.email}`, // list of receivers
        subject: "Node Contact Request", // Subject line
        text: "Hello world?", // plain text body
        html: "Thanks for registering in yelpcamp hope you enjoy surfing here", // html body
    }, (error, info) => {
        if (error) {
            return console.log(error)
        }
        console.log("Message sent:", info.messageId)
        console.log("Preview URL:", nodemailer.getTestMessageUrl(info))
    });

    res.status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(createdUser)
}


module.exports.login = async (req, res) => {
    // req.flash('success', 'welcome back!');
    // const redirectUrl = req.session.returnTo || '/campgrounds';
    // delete req.session.returnTo;
    // res.redirect(redirectUrl);
    const { username, password } = req.body

    if (!username && !password) {
        throw new ExpressError("username and password  is required", 400)
    }

    const user = await User.findOne({
        username
    })

    if (!user) {
        throw new ExpressError("User does not exist", 404)
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ExpressError("Invalid user credentials", 401)
    }


    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .send(
            {
                user: loggedInUser, accessToken, refreshToken
            }
        )
}

module.exports.logout = async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .send("User Logged Out")
}


module.exports.refreshtoken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    // console.log(incomingRefreshToken)
    if (!incomingRefreshToken) {
        throw new ExpressError("Unauthorized request", 401)
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.RefreshTokenSecret);

        const user = await User.findById(decodedToken?._id)
        // console.log(user)

        if (!user) {
            throw new ExpressError("Invalid refresh token", 401)
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ExpressError("Refresh token is expired or used", 401)
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
        // console.log(accessToken, refreshToken)
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ accessToken, refreshToken })
    } catch (error) {
        throw new ExpressError(error?.message || "invalid refresh token", 401)
    }
}