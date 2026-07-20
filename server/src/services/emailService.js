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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendReminderEmail({ to, name, type, date, time, notifyBefore, description }) {
  const safe = {
    name: escapeHtml(name),
    type: escapeHtml(type),
    date: escapeHtml(date),
    time: escapeHtml(time),
    notifyBefore: escapeHtml(notifyBefore),
    description: escapeHtml(description),
  };

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
          <p style="color:#374151;margin-top:0;">Hi <strong>${safe.name}</strong>,</p>
          <p style="color:#374151;">You have an upcoming <strong>${safe.type}</strong> coming up!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:10px 0;color:#6B7280;">Date &amp; Time</td><td style="padding:10px 0;font-weight:600;">${safe.date} at ${safe.time}</td></tr>
            <tr><td style="padding:10px 0;color:#6B7280;">Type</td><td style="padding:10px 0;font-weight:600;">${safe.type}</td></tr>
            ${safe.description ? `<tr><td style="padding:10px 0;color:#6B7280;">Notes</td><td style="padding:10px 0;">${safe.description}</td></tr>` : ""}
            <tr><td style="padding:10px 0;color:#6B7280;">Notify Before</td><td style="padding:10px 0;">${safe.notifyBefore}</td></tr>
          </table>
          <p style="color:#9CA3AF;font-size:12px;">Smart Study Planner — Stay on track!</p>
        </div>
      </div>`,
  });
}
