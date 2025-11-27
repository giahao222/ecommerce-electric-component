const nodemailer = require("nodemailer");
const mailConfig = require("../config/mailConfig");

exports.sendMail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: mailConfig.MAIL_HOST,
      port: mailConfig.MAIL_PORT,
      secure: mailConfig.MAIL_PORT == 465, 
      auth: {
        user: mailConfig.MAIL_USER,
        pass: mailConfig.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: mailConfig.MAIL_FROM,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
