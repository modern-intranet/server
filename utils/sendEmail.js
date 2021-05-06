const nodemailer = require("nodemailer");

async function sendEmail({ to, title, list }) {
  if (!to.length) return;

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
      from: '"Đặt cơm tự động" <tonys_trinh@outlook.com>',
      to: to.join(", "),
      subject: title,
      text: JSON.stringify(list),
      html: `<h3>${title}</h3>
            ${list.map(
              (l) =>
                `<b>Họ tên</b>: ${l.user}<br /><b>Món</b>: ${l.dish}<br /><br />`
            )}
        `,
    });

    console.log("- Send email successfully ✓");
  } catch (err) {
    console.log("- Send email failed ⚠");
    console.log(`- ${err.message}`);
  }
}

module.exports = sendEmail;
