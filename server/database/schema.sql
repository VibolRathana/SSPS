-- ============================================================
--  Smart Study Planner System
--  Database schema  ·  MySQL 8.0
--  File: server/database/schema.sql
-- ============================================================

DROP DATABASE IF EXISTS smart_study_planner;
CREATE DATABASE smart_study_planner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE smart_study_planner;

-- ------------------------------------------------------------
-- 1. users
--    available_hours = hours/day the student can study (used by AI scoring)
-- ------------------------------------------------------------
CREATE TABLE users (
  user_id          INT AUTO_INCREMENT PRIMARY KEY,
  full_name        VARCHAR(100) NOT NULL,
  email            VARCHAR(150) NOT NULL UNIQUE,
  password_hash    VARCHAR(255) NOT NULL,
  role             ENUM('Admin','Student')   NOT NULL DEFAULT 'Student',
  status           ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  major            VARCHAR(100),
  phone            VARCHAR(30),
  bio              VARCHAR(255),
  avatar_url       VARCHAR(255),
  available_hours  INT NOT NULL DEFAULT 4,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login       TIMESTAMP NULL,
  CONSTRAINT chk_users_available_hours CHECK (available_hours > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. courses
--    Normalizes the course name shown on every screen so it is
--    stored once and referenced by id (3NF, avoids repetition).
-- ------------------------------------------------------------
CREATE TABLE courses (
  course_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(20),
  color       VARCHAR(7) NOT NULL DEFAULT '#6366F1',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_user FOREIGN KEY (user_id)
      REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. tasks
--    difficulty + estimated_hours feed the AI score;
--    priority + status drive what the UI displays.
-- ------------------------------------------------------------
CREATE TABLE tasks (
  task_id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  course_id        INT,
  title            VARCHAR(150) NOT NULL,
  description      TEXT,
  difficulty       ENUM('Easy','Medium','Hard')          NOT NULL DEFAULT 'Medium',
  priority         ENUM('Low','Medium','High')           NOT NULL DEFAULT 'Medium',
  estimated_hours  INT NOT NULL DEFAULT 1,
  due_date         DATE NOT NULL,
  due_time         TIME DEFAULT '23:59:00',
  progress         INT NOT NULL DEFAULT 0,
  status           ENUM('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_user   FOREIGN KEY (user_id)
      REFERENCES users(user_id)   ON DELETE CASCADE,
  CONSTRAINT fk_tasks_course FOREIGN KEY (course_id)
      REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT chk_tasks_progress CHECK (progress BETWEEN 0 AND 100),
  CONSTRAINT chk_tasks_hours    CHECK (estimated_hours > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. assignments
-- ------------------------------------------------------------
CREATE TABLE assignments (
  assignment_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  course_id      INT,
  title          VARCHAR(150) NOT NULL,
  description    TEXT,
  due_date       DATE NOT NULL,
  due_time       TIME DEFAULT '23:59:00',
  status         ENUM('Pending','In Progress','Submitted','Graded') NOT NULL DEFAULT 'Pending',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_assignments_user   FOREIGN KEY (user_id)
      REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_assignments_course FOREIGN KEY (course_id)
      REFERENCES courses(course_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. examinations
-- ------------------------------------------------------------
CREATE TABLE examinations (
  exam_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  course_id    INT,
  subject      VARCHAR(150) NOT NULL,
  exam_date    DATE NOT NULL,
  exam_time    TIME DEFAULT '09:00:00',
  preparation  INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_user   FOREIGN KEY (user_id)
      REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_exams_course FOREIGN KEY (course_id)
      REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT chk_exam_prep CHECK (preparation BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. reminders
--    reference_id points at the related task/assignment/exam
--    (its meaning depends on reminder_type).
-- ------------------------------------------------------------
CREATE TABLE reminders (
  reminder_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  reminder_type  ENUM('Task','Assignment','Exam','Study Session') NOT NULL,
  reference_id   INT,
  remind_date    DATE NOT NULL,
  remind_time    TIME NOT NULL DEFAULT '23:59:00',
  notify_before  ENUM('15 minutes','1 hour','1 day') NOT NULL DEFAULT '1 hour',
  email_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reminders_user FOREIGN KEY (user_id)
      REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. notifications
-- ------------------------------------------------------------
CREATE TABLE notifications (
  notification_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  title            VARCHAR(150) NOT NULL,
  message          VARCHAR(255),
  type             ENUM('Task','Assignment','Exam','Reminder','System') NOT NULL DEFAULT 'System',
  status           ENUM('Unread','Read') NOT NULL DEFAULT 'Unread',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
      REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. study_sessions
--    Logged study time — powers the "study hours by course"
--    bar chart and the "hours studied" stat on the dashboard.
-- ------------------------------------------------------------
CREATE TABLE study_sessions (
  session_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  course_id     INT,
  hours         DECIMAL(4,1) NOT NULL,
  session_date  DATE NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user   FOREIGN KEY (user_id)
      REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_sessions_course FOREIGN KEY (course_id)
      REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT chk_sessions_hours CHECK (hours > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. ai_recommendations
--    Stores the output of the AI scoring service (priority_score
--    + recommended action) shown on the AI Recommendations page.
-- ------------------------------------------------------------
CREATE TABLE ai_recommendations (
  recommendation_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  task_id             INT,
  priority_score      INT NOT NULL,
  recommended_action  VARCHAR(255) NOT NULL,
  generated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reco_user FOREIGN KEY (user_id)
      REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_reco_task FOREIGN KEY (task_id)
      REFERENCES tasks(task_id) ON DELETE CASCADE,
  CONSTRAINT chk_reco_score CHECK (priority_score BETWEEN 0 AND 100)
) ENGINE=InnoDB;

-- ============================================================
--  Indexes for query optimization
--  (foreign keys are auto-indexed by InnoDB; these speed up
--   the most common dashboard lookups.)
-- ============================================================
CREATE INDEX idx_tasks_user_status    ON tasks(user_id, status);
CREATE INDEX idx_tasks_due            ON tasks(due_date);
CREATE INDEX idx_assignments_user_due ON assignments(user_id, due_date);
CREATE INDEX idx_exams_user_date      ON examinations(user_id, exam_date);
CREATE INDEX idx_reminders_active     ON reminders(user_id, is_active);
CREATE INDEX idx_notifications_status ON notifications(user_id, status);
CREATE INDEX idx_sessions_user_date   ON study_sessions(user_id, session_date);

-- ============================================================
--  Views — convenience queries for the dashboard
-- ============================================================

-- Upcoming, still-open deadlines across tasks and assignments
CREATE OR REPLACE VIEW vw_upcoming_deadlines AS
  SELECT 'Task' AS item_type, t.title, c.name AS course, t.due_date, t.due_time, t.user_id
  FROM tasks t
  LEFT JOIN courses c ON t.course_id = c.course_id
  WHERE t.status <> 'Completed'
  UNION ALL
  SELECT 'Assignment', a.title, c.name, a.due_date, a.due_time, a.user_id
  FROM assignments a
  LEFT JOIN courses c ON a.course_id = c.course_id
  WHERE a.status NOT IN ('Submitted','Graded');

-- Total study hours grouped by course (bar chart data)
CREATE OR REPLACE VIEW vw_study_hours_by_course AS
  SELECT s.user_id, c.name AS course, c.color, SUM(s.hours) AS total_hours
  FROM study_sessions s
  JOIN courses c ON s.course_id = c.course_id
  GROUP BY s.user_id, c.course_id, c.name, c.color;

-- Task status breakdown per user (pie chart data)
CREATE OR REPLACE VIEW vw_task_status_breakdown AS
  SELECT user_id, status, COUNT(*) AS total
  FROM tasks
  GROUP BY user_id, status;