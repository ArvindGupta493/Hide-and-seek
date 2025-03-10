const transporter = require('../config/mailer');

async function sendOtpEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
