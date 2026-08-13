# ✉️ Free Email OTP Authentication Setup Guide (Hostinger SMTP)

This guide explains how to send **Email OTPs for free ($0 extra cost)** using your existing Hostinger Web Hosting Email Account.

---

## 🌟 Why Hostinger Email OTP?
Standard SMS services (like Twilio, Fast2SMS) charge per SMS sent. Hostinger includes **free custom domain business email accounts** (e.g., `no-reply@yourdomain.com`, `auth@yourdomain.com`) with every hosting package. 

By leveraging Hostinger's standard **SMTP server**, you can send unlimited 6-digit OTP verification emails to your users completely free of charge.

---

## ⚙️ Hostinger SMTP Configuration Details

| Parameter | Recommended Value | Alternative Value |
| :--- | :--- | :--- |
| **SMTP Host** | `smtp.hostinger.com` | `smtp.hostinger.com` |
| **Port** | `465` (SSL / TLS) | `587` (STARTTLS) |
| **Security** | `SSL` (`secure: true`) | `STARTTLS` (`secure: false`) |
| **Username** | Your Hostinger Email (e.g., `auth@yourdomain.com`) | `support@yourdomain.com` |
| **Password** | Hostinger Email Account Password | Email Password |

---

## 💻 Backend Implementation Code Snippets

### 1. Node.js / Express Implementation (`nodemailer`)

Install `nodemailer`:
```bash
npm install nodemailer dotenv
```

Configuration & OTP Service (`otpService.js`):
```javascript
const nodemailer = require('nodemailer');

// Hostinger Transporter Setup
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.HOSTINGER_EMAIL_USER, // e.g. auth@yourdomain.com
    pass: process.env.HOSTINGER_EMAIL_PASS, // Hostinger Email Password
  },
});

// Generate 6-Digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email Function
async function sendEmailOTP(recipientEmail, otpCode) {
  const mailOptions = {
    from: `"Agri Farm Monitoring" <${process.env.HOSTINGER_EMAIL_USER}>`,
    to: recipientEmail,
    subject: `🔐 Your Login Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #f0f2f5; border-radius: 16px;">
        <h2 style="color: #1e293b;">Agri Farm Portal Verification</h2>
        <p style="color: #64748b; font-size: 15px;">Use the following 6-digit OTP code to complete your login or registration:</p>
        <div style="background: #ffffff; padding: 18px; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; text-align: center; margin: 20px 0; border: 1px solid #cbd5e1;">
          ${otpCode}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendEmailOTP };
```

---

### 2. Python / Flask Implementation (`smtplib`)

Python handles Hostinger SMTP natively via standard library `smtplib`:

```python
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

HOSTINGER_SMTP = "smtp.hostinger.com"
HOSTINGER_PORT = 465
HOSTINGER_USER = os.getenv("HOSTINGER_EMAIL_USER")  # e.g., auth@yourdomain.com
HOSTINGER_PASS = os.getenv("HOSTINGER_EMAIL_PASS")

def send_email_otp(target_email: str, otp_code: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🔐 Your Agri Farm OTP: {otp_code}"
    msg["From"] = f"Agri Farm Portal <{HOSTINGER_USER}>"
    msg["To"] = target_email

    html_content = f"""
    <div style="font-family: sans-serif; padding: 20px; background-color: #e8eef5; border-radius: 12px;">
        <h2 style="color: #1e293b;">Agri Farm Security Code</h2>
        <p style="color: #64748b;">Your single-use verification code is:</p>
        <h1 style="color: #2563eb; letter-spacing: 6px; text-align: center;">{otp_code}</h1>
        <p style="color: #94a3b8; font-size: 12px;">Valid for 10 minutes.</p>
    </div>
    """
    
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP_SSL(HOSTINGER_SMTP, HOSTINGER_PORT) as server:
        server.login(HOSTINGER_USER, HOSTINGER_PASS)
        server.sendmail(HOSTINGER_USER, target_email, msg.as_string())
        print(f"OTP sent successfully to {target_email}")
```

---

## 🔒 Security Best Practices
1. **Store OTPs with Expiration**: Store the OTP hash in Redis or database with a 5-10 minute TTL.
2. **Rate Limiting**: Limit OTP requests to max 3 requests per 10 minutes per email address.
3. **Environment Variables**: Always store `HOSTINGER_EMAIL_USER` and `HOSTINGER_EMAIL_PASS` in `.env` files.
