const nodemailer = require("nodemailer");

const mailSender = async (email, title, body, attachment) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let mailOptions = {
      from: `"Fish Galaxy" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    };

    // If attachment is passed, add it
    if (attachment) {
      mailOptions.attachments = [attachment];
    }

    let info = await transporter.sendMail(mailOptions);

    return info;
  } catch (error) {
    console.log("Mail send error:", error.message);
  }
};

module.exports = mailSender;
