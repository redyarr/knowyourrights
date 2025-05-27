// Basic email sending utility (using a placeholder for actual implementation)

// TODO: Replace with actual email sending library like Nodemailer

exports.sendEmail = async (to, subject, text, html) => {
    const nodemailer = require('nodemailer');

    // Configure your SMTP transporter
    // Use environment variables for sensitive information
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    let mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER, // Sender address
        to: to, // List of recipients
        subject: subject, // Subject line
        text: text, // Plain text body
        html: html // HTML body
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
};