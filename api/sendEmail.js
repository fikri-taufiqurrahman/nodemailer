const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { to, subject, text } = req.body;

  // Validasi input dari frontend
  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ message: "Missing required fields: to, subject, text" });
  }

  // Konfigurasi transporter Nodemailer
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // Contoh: 'gmail'
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Konfigurasi email
  const mailOptions = {
    from: process.env.EMAIL_USER, // Email pengirim (dari .env)
    to, // Email tujuan dikirim dari frontend
    subject,
    text,
  };

  try {
    // Kirim email
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);

    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
