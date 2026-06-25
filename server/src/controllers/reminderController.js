import { Reminder } from "../models/index.js";

function fmt(r) {
  return {
    id:            r.reminder_id,
    type:          r.reminder_type,
    description:   r.description,
    date:          r.remind_date ? new Date(r.remind_date + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : null,
    time:          r.remind_time,
    rawDate:       r.remind_date,
    rawTime:       r.remind_time?.slice(0, 5),
    notifyBefore:  r.notify_before,
    emailEnabled:  r.email_enabled,
    isActive:      r.is_active,
    emailSent:     r.email_sent,
  };
}

export async function getReminders(req, res) {
  try {
    const rows = await Reminder.findAll({
      where: { user_id: req.user.id },
      order: [["remind_date", "ASC"], ["remind_time", "ASC"]],
    });
    res.json(rows.map(fmt));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createReminder(req, res) {
  try {
    const { type, remindDate, remindTime, notifyBefore, description } = req.body;
    if (!type || !remindDate || !remindTime)
      return res.status(400).json({ message: "Type, date, and time are required" });
    const r = await Reminder.create({
      user_id:       req.user.id,
      reminder_type: type,
      description:   description || null,
      remind_date:   remindDate,
      remind_time:   remindTime,
      notify_before: notifyBefore || "1 hour",
    });
    res.status(201).json({ id: r.reminder_id, message: "Reminder created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateReminder(req, res) {
  try {
    const { type, remindDate, remindTime, notifyBefore, description } = req.body;

    const updates = { email_sent: false };
    if (type        != null) updates.reminder_type = type;
    if (description != null) updates.description   = description;
    if (remindDate  != null) updates.remind_date    = remindDate;
    if (remindTime  != null) updates.remind_time    = remindTime;
    if (notifyBefore!= null) updates.notify_before  = notifyBefore;

    const [count] = await Reminder.update(updates, {
      where: { reminder_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function toggleReminder(req, res) {
  try {
    const reminder = await Reminder.findOne({
      where: { reminder_id: req.params.id, user_id: req.user.id },
    });
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    await reminder.update({ is_active: !reminder.is_active });
    res.json({ message: "Toggled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteReminder(req, res) {
  try {
    const count = await Reminder.destroy({
      where: { reminder_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
