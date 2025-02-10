const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for port 465, false for other ports
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.NodemailerUser,
        pass: process.env.NodemailerPass,
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter