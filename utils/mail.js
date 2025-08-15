import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Brevo SMTP host
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER, // your Brevo SMTP login
    pass: process.env.BREVO_PASS, // your Brevo SMTP password
  },
  tls: {
    rejectUnauthorized: false, // ignore self-signed certificate issues
  },
});

export const sendOtpMail = async (email, otp) => {
  console.log("Sending OTP:", otp, "to email:", email);

  const mailOptions = {
    from: `"HubStar Support" <support@hubstar.in>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family:sans-serif">
        <h2>Forgot Password</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Mail sent:", info.messageId);
};
