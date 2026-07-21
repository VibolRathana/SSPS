USE smart_study_planner;

ALTER TABLE reminders
    ADD COLUMN push_sent BOOLEAN NOT NULL DEFAULT FALSE AFTER email_sent;