const nodemailer = require('nodemailer');

const sendMail = async ({ to, subject, text, html }) => {
  let transporter;

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  }

  await transporter.sendMail({
    from: '"Donation App" <no-reply@donation.com>',
    to,
    subject,
    text,
    html,
  });

  console.log(`Email sent to ${to} (${process.env.NODE_ENV})`);
};

module.exports = { sendMail };
