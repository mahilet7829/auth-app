// backend/services/emailService.js
import nodemailer from 'nodemailer';

// Check if email credentials are configured
const hasValidEmailConfig = process.env.EMAIL_USER && 
                            process.env.EMAIL_PASS && 
                            process.env.EMAIL_USER !== 'your_email@gmail.com';

let transporter = null;

// Only create transporter if valid credentials exist
if (hasValidEmailConfig) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Verify connection (don't let it crash)
  transporter.verify((error, success) => {
    if (error) {
      console.log('⚠️ Email service not configured - emails will be logged to console');
      transporter = null;
    } else {
      console.log('✅ Email service is ready');
    }
  });
} else {
  console.log('⚠️ Email credentials not configured - emails will be logged to console');
}

// Send verification email (with fallback)
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  
  // Log to console for development
  console.log('\n📧 ========== VERIFICATION EMAIL ==========');
  console.log(`To: ${email}`);
  console.log(`Link: ${verificationUrl}`);
  console.log('===========================================\n');
  
  // If transporter exists, try to send real email
  if (transporter) {
    try {
      const mailOptions = {
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Our Platform!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error.message);
    }
  }
  
  return { success: true, verificationUrl };
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  
  console.log('\n📧 ========== PASSWORD RESET EMAIL ==========');
  console.log(`To: ${email}`);
  console.log(`Link: ${resetUrl}`);
  console.log('==============================================\n');
  
  if (transporter) {
    try {
      const mailOptions = {
        from: `"Auth System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `<a href="${resetUrl}">Reset Password</a>`
      };
      
      await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully');
    } catch (error) {
      console.error('Failed to send email:', error.message);
    }
  }
  
  return { success: true };
};

export default { sendVerificationEmail, sendPasswordResetEmail };