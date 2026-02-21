const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* TEST MAIL */
exports.sendTestMail = async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"SMTP Test" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVER_MAIL,
      subject: "SMTP Working ✔",
      text: "If you received this, backend mail is working.",
    });

    res.send("Test mail sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Mail failed");
  }
};

/* CONTACT FORM MAIL */
exports.sendContactMail = async (req, res) => {
  try {
    const { name, email, phone, city } = req.body;

    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

   const mailOptions = {
  from: `"Goodwill Global Solutions" <${process.env.SMTP_USER}>`,
  to: process.env.RECEIVER_MAIL,
  subject: "New Door Step Counselling Enquiry",
  html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:30px;">
    
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 20px rgba(0,0,0,0.08);">

      <div style="background:#253E90; padding:15px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="color:#ffffff;">
    <tr>
      
      <!-- Logo Left -->
      <td align="left" style="vertical-align:middle;">
        <img 
          src="https://goodwillglobalsolutions.com/static/media/hlogo22.97bec09ef02b30201db6.png" 
          alt="Goodwill Logo" 
          style="height:55px; display:block;"
        />
      </td>

      <!-- Company Name Right -->
      <td align="right" style="vertical-align:middle;">
        <div style="font-size:18px; font-weight:normal;">
             Door Step Counselling Request
         </div>
        
      </td>

    </tr>
  </table>
</div>

      <!-- Body -->
      <div style="padding:25px; color:#333;">
        <h3 style="margin-top:0;">New Enquiry Received</h3>

        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:8px; font-weight:bold;">Name:</td>
            <td style="padding:8px;">${name}</td>
          </tr>
          <tr style="background:#f7f9fc;">
            <td style="padding:8px; font-weight:bold;">Email:</td>
            <td style="padding:8px;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px; font-weight:bold;">Phone:</td>
            <td style="padding:8px;">${phone}</td>
          </tr>
          <tr style="background:#f7f9fc;">
            <td style="padding:8px; font-weight:bold;">City:</td>
            <td style="padding:8px;">${city}</td>
          </tr>
        </table>

        <p style="margin-top:20px; font-size:13px; color:#666;">
          This enquiry was submitted through the website contact form.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f3f7; padding:15px 25px; font-size:12px; color:#555;">
        <p style="margin:0;">
          © ${new Date().getFullYear()} Goodwill Global Solutions
        </p>
        <p style="margin:3px 0 0;">
          <a href="http://goodwillglobalsolutions.com" style="color:#253E90; text-decoration:none;">
            www.goodwillglobalsolutions.com
          </a>
        </p>
      </div>

    </div>
  </div>
  `,
};


    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Mail failed",
    });
  }
};
