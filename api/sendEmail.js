const cors = require("cors");
const nodemailer = require("nodemailer");

// Middleware helper untuk serverless
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  // Terapkan CORS
  await runMiddleware(
    req,
    res,
    cors({
      origin: "http://localhost:5173", // Atur asal yang diizinkan
      methods: ["POST"], // Metode yang diizinkan
      allowedHeaders: ["Content-Type"],
    })
  );

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res
      .status(400)
      .json({ message: "Missing required fields: to, subject, text" });
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
