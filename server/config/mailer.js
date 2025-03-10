const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'thearvindgupta493@gmail.com',
      pass: 'safy yogj sfgj efse'           
    }
  });
  

module.exports = transporter;
