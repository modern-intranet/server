const nodemailer = require("nodemailer");
const logger = require("../utils/winston");

async function sendEmail({ to, title, list }) {
  if (!to.length) {
    return logger.info("[Cron] No record");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Modern Intranet" <${process.env.EMAIL_USERNAME}>`,
      to: to.join(", "),
      subject: title,
      text: JSON.stringify(list),
      html: `${list.map(
        (l) => `<b>Họ tên</b>: ${l.user}<br /><b>Món</b>: ${l.dish}<br /><br />`
      )}
        `,
    });
    logger.info("[Cron] Send email successfully");
  } catch (err) {
    logger.error(`[Cron] Send email failed ${err.message}`);
  }
}

module.exports = sendEmail;
