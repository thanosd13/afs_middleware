const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.API_KEY_SENDGRID, // sendGrid API Key
    },
  })
);

const sendEmail = async function (to, subject, htmlContent) {
  const mailOptions = {
    from: "dimopthan@gmail.com", // sender
    to: to, // receiver
    subject: subject || "AFS app", // subject
    html: htmlContent, // html body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
