/**
 * emailService.js
 * Handles direct email dispatch for Happy Moments lead inquiries.
 * Supports Nodemailer SMTP (Gmail, Outlook, Custom SMTP) and direct Web3Forms fallback.
 */

const nodemailer = require('nodemailer');

async function sendLeadEmail({ to, subject, data }) {
    const targetEmail = to || process.env.LEAD_NOTIFICATION_EMAIL || 'social@mycoffeeco.com';

    // Build HTML Table for the Lead
    const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
            <div style="background: #0A06FF; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 700;">☕ New Happy Moments Lead Inquiry</h2>
                <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">My Coffee Co. Storefront Form Submission</p>
            </div>
            <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333333;">
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #0A06FF;">Social Media Handle:</td>
                        <td style="padding: 10px 0; font-weight: bold;">${data['Social Handle'] || 'N/A'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px 0; font-weight: bold; color: #555555;">Full Name:</td>
                        <td style="padding: 10px 0;">${data['Full Name'] || 'N/A'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px 0; font-weight: bold; color: #555555;">Phone Number:</td>
                        <td style="padding: 10px 0;">${data['Phone Number'] || 'N/A'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px 0; font-weight: bold; color: #555555;">One Word Mood:</td>
                        <td style="padding: 10px 0;">${data['One Word Mood'] || 'N/A'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 10px 0; font-weight: bold; color: #555555;">Share Anonymously:</td>
                        <td style="padding: 10px 0;">${data['Share Anonymously'] || 'No'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0 4px 0; font-weight: bold; color: #555555;" colspan="2">Happy Moment Story:</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; background: #f9f9fc; border-radius: 8px; font-style: italic; line-height: 1.6;" colspan="2">
                            "${data['Happy Moment Story'] || 'No story provided'}"
                        </td>
                    </tr>
                </table>
            </div>
            <div style="background: #f4f4f8; padding: 12px; text-align: center; font-size: 12px; color: #777777;">
                Sent automatically by My Coffee Co. Middleware Backend
            </div>
        </div>
    `;

    // Method 1: Check if SMTP env vars are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            console.log(`[EmailService] Attempting SMTP dispatch to ${targetEmail}...`);
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            await transporter.sendMail({
                from: `"My Coffee Co. Events" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: targetEmail,
                subject: subject || `🎉 New Happy Moments Story from ${data['Social Handle'] || data['Full Name']}`,
                html: htmlBody
            });

            console.log(`[EmailService] SMTP email sent successfully to ${targetEmail}!`);
            return { success: true, method: 'smtp' };
        } catch (err) {
            console.error('[EmailService] SMTP send error:', err.message);
        }
    }

    // Method 2: Fallback API dispatch
    try {
        console.log(`[EmailService] Attempting HTTP email dispatch to ${targetEmail}...`);
        const res = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Referer': 'https://mycoffeeco.com'
            },
            body: JSON.stringify({
                _subject: subject || `🎉 New Happy Moments Story from ${data['Social Handle'] || data['Full Name']}`,
                _template: 'table',
                ...data
            })
        });
        const result = await res.json().catch(() => ({}));
        console.log(`[EmailService] HTTP email response:`, result);
        return { success: true, method: 'http', response: result };
    } catch (err) {
        console.error('[EmailService] HTTP email send error:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = { sendLeadEmail };
