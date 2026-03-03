const nodemailer = require('nodemailer');

const handleContactSubmission = async (req, res) => {
  const { email, fullName, phone, type } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let mailSubject, mailHtml;

  if (type === 'newsletter') {
    mailSubject = '📩 New Newsletter Subscription';
    mailHtml = `<div style="font-family: Arial;"><h2>Newsletter Signup</h2><p>Email: ${email}</p></div>`;
  } else {
    mailSubject = '📞 New Counselling Lead';
    mailHtml = `
      <div style="font-family: Arial; padding: 20px; border: 1px solid #2F4DA6;">
        <h2 style="color: #2F4DA6;">Free Counselling Request</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Phone:</strong> ${phone}</p>
      </div>`;
  }

  const mailOptions = {
    // IMPORTANT: 'from' must be your SMTP_USER for Hostinger
    from: `"Goodwill Website" <${process.env.SMTP_USER}>`, 
    to: 'info@goodwillglobalsolutions.com',
    subject: mailSubject,
    html: mailHtml,
    // Allows you to reply directly to the customer
    replyTo: type === 'newsletter' ? email : 'info@goodwillglobalsolutions.com'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Sent successfully!" });
  } catch (error) {
    console.error("Hostinger SMTP Error:", error);
    res.status(500).json({ success: false, message: "Email failed to send." });
  }
};

module.exports = { handleContactSubmission };