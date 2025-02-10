const ExpressError = require("./ExpressError")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        // console.log("hey")
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken();
        // console.log("access & refresh", accessToken, refreshToken)

        user.refreshToken = refreshToken
        await user.save()

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ExpressError("Something went wrong while generating referesh and access token", 500)
    }
}

module.exports = generateAccessAndRefereshTokens