const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, code) => {
  const verificationLink = `${process.env.APP_URL}/verify-email`;

  const mailOptions = {
    from: `"Techerudite Auth System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email Address",
    text: `Your verification code is: ${code}. Please visit ${verificationLink} to enter the code and verify your email.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Techerudite</h2>
        <p>Thank you for registering. Please use the verification code below to verify your email address:</p>
        <h3 style="background-color: #f0f0f0; display: inline-block; padding: 10px 20px; border-radius: 5px;">${code}</h3>
        <p>Or click the button below to go to the verification page:</p>
        <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p style="margin-top: 20px;">If you didn’t request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
