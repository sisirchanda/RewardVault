const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(to, otp) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] OTP for ${to}: ${otp}`);
    return;
  }
  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your RewardVault verification code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#16a34a">RewardVault</h2>
        <p>Your verification code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111;margin:24px 0">${otp}</div>
        <p style="color:#666">This code expires in 10 minutes. Never share it with anyone.</p>
      </div>
    `,
  });
}

async function sendCashbackNotification(to, cashbackAmount, merchantName, status) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EMAIL] Cashback ${status}: $${cashbackAmount} from ${merchantName} → ${to}`);
    return;
  }
  const transporter = createTransport();
  const labels = { pending: 'Pending', confirmed: 'Confirmed!', paid: 'Paid!' };
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your cashback from ${merchantName} is ${labels[status] || status}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#16a34a">RewardVault — Cashback Update</h2>
        <p>Your <strong>$${cashbackAmount}</strong> cashback from <strong>${merchantName}</strong>
           is now <strong>${labels[status]}</strong>.</p>
        <p>Log in to your dashboard to view your balance and withdraw earnings.</p>
      </div>
    `,
  });
}

module.exports = { generateOTP, sendOTPEmail, sendCashbackNotification };