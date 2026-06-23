import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReminderEmail({ to, name, type, date, time, notifyBefore, description }) {
  await transporter.sendMail({
    from: `"Smart Study Planner" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reminder: ${type} on ${date}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#4F46E5;padding:24px 28px;">
          <h1 style="color:#fff;margin:0;font-size:20px;">⏰ Study Planner Reminder</h1>
        </div>
        <div style="padding:24px 28px;">
          <p style="color:#374151;margin-top:0;">Hi <strong>${name}</strong>,</p>
          <p style="color:#374151;">You have an upcoming <strong>${type}</strong> coming up!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#6B7280;font-size:14px;">Date &amp; Time</td>
              <td style="padding:10px 0;font-weight:600;font-size:14px;">${date} at ${time}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#6B7280;font-size:14px;">Type</td>
              <td style="padding:10px 0;font-weight:600;font-size:14px;">${type}</td>
            </tr>
            ${description ? `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#6B7280;font-size:14px;">Notes</td>
              <td style="padding:10px 0;font-size:14px;">${description}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:10px 0;color:#6B7280;font-size:14px;">Notify Before</td>
              <td style="padding:10px 0;font-size:14px;">${notifyBefore}</td>
            </tr>
          </table>
          <p style="color:#9CA3AF;font-size:12px;margin-bottom:0;">Smart Study Planner — Stay on track!</p>
        </div>
      </div>
    `,
  });
}
