const nodemailer = require("nodemailer");

exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, address, service, message } = req.body;

    // Create transporter (Gmail example)
    const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.SMTP_USER, // e.g., info@goodwillglobalsolutions.com
    pass: process.env.SMTP_PASS, // Your actual Hostinger email password
  },
});

    const mailOptions = {
  // 1. MUST be your authenticated Hostinger email
  from: `"Goodwill Enquiry" <${process.env.SMTP_USER}>`, 
  
  // 2. Where the email is going
  to: "info@goodwillglobalsolutions.com", 
  
  // 3. THIS is where you put the customer's email (testing@gmail.com)
  // This allows you to click 'Reply' in your inbox and talk to them.
  replyTo: email, 
  
  subject: `New Message from ${name}: ${service}`,
  html: `
    <h3>New Website Enquiry</h3>
    <p><strong>From:</strong> ${name} (${email})</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Service:</strong> ${service}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
};

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (error) {
    console.error("MAIL ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};