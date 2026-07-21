-- ============================================================
--  Smart Study Planner System
--  Database schema  ·  MySQL 8.0
-- ============================================================

DROP DATABASE IF EXISTS smart_study_planner;
CREATE DATABASE smart_study_planner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE smart_study_planner;

-- ------------------------------------------------------------
-- 1. users
-- ------------------------------------------------------------
CREATE TABLE users (
  user_id               INT AUTO_INCREMENT PRIMARY KEY,
  full_name             VARCHAR(100) NOT NULL,
  email                 VARCHAR(150) NOT NULL UNIQUE,
  password_hash         VARCHAR(255) NOT NULL,
  role                  ENUM('Admin','Student') NOT NULL DEFAULT 'Student',
  major                 VARCHAR(100),
  phone                 VARCHAR(30),
  bio                   VARCHAR(255),
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login            TIMESTAMP NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. courses
--    One row per course per user; reused by tasks, assignments,
--    exams and study sessions via course_id FK.
-- ------------------------------------------------------------
CREATE TABLE courses (
  course_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  code       VARCHAR(20),
  color      VARCHAR(7) NOT NULL DEFAULT '#6366F1',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_user FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. tasks
-- ------------------------------------------------------------
CREATE TABLE tasks (
  task_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  course_id   INT,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  difficulty ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  estimated_hours DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  progress INT NOT NULL DEFAULT 0,
  status      ENUM('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  due_date    DATE NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_task_estimated_hours CHECK (estimated_hours > 0),
  CONSTRAINT chk_task_progress CHECK(progress BETWEEN 0 AND 100),
  CONSTRAINT fk_tasks_user   FOREIGN KEY (user_id)
    REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_tasks_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. assignments
-- ------------------------------------------------------------
CREATE TABLE assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  course_id     INT,
  title         VARCHAR(150) NOT NULL,
  description   TEXT,
  difficulty    ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  estimated_hours DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  progress      INT NOT NULL DEFAULT 0,
  status        ENUM('Pending','In Progress','Submitted','Graded') NOT NULL DEFAULT 'Pending',
  due_date      DATE NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_assignments_estimated_hours CHECK(estimated_hours >0),
  CONSTRAINT chk_assignments_progress CHECK(progress BETWEEN 0 AND 100),
  CONSTRAINT fk_assignments_user   FOREIGN KEY (user_id)
    REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_assignments_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. examinations
-- ------------------------------------------------------------
CREATE TABLE examinations (
  exam_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  course_id   INT,
  subject     VARCHAR(150) NOT NULL,
  difficulty ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
   estimated_hours DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  exam_date   DATE NOT NULL,
  preparation INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exams_user   FOREIGN KEY (user_id)
    REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_exams_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT chk_exam_prep CHECK (preparation BETWEEN 0 AND 100),
  CONSTRAINT chk_exam_estimated_hours CHECK( estimated_hours >0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. reminders
-- ------------------------------------------------------------
CREATE TABLE reminders (
    reminder_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reminder_type ENUM('Task','Assignment','Exam','Study Session') NOT NULL,
    description VARCHAR(255),
    remind_date DATE NOT NULL,
    remind_time TIME NOT NULL DEFAULT '23:59:00',
    notify_before ENUM('15 minutes','1 hour','1 day') DEFAULT '1 hour',
    email_enabled BOOLEAN DEFAULT TRUE,
    email_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reminder_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ------------------------------------------------------------
-- 7. study_sessions
--    Each row is one planned/logged study block on the Schedule
--    page.  duration is in hours (decimal for 1.5 h etc.).
-- ------------------------------------------------------------
CREATE TABLE study_sessions (
  session_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  course_id    INT,
  title        VARCHAR(150) NOT NULL,
  session_date DATE NOT NULL,
  start_time   TIME NOT NULL DEFAULT '08:00:00',
  duration     DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  color        VARCHAR(20) NOT NULL DEFAULT 'indigo',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user   FOREIGN KEY (user_id)
    REFERENCES users(user_id)     ON DELETE CASCADE,
  CONSTRAINT fk_sessions_course FOREIGN KEY (course_id)
    REFERENCES courses(course_id) ON DELETE SET NULL,
  CONSTRAINT chk_sessions_duration CHECK (duration > 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. ai_recommendations
--    Stores every AI study plan generated for a user.
--    recommended_action is TEXT because AI responses can be long.
-- ------------------------------------------------------------
CREATE TABLE ai_recommendations (
  recommendation_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL,
  priority_score     INT NOT NULL DEFAULT 0,
  recommended_action TEXT NOT NULL,
  generated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reco_user  FOREIGN KEY (user_id)
    REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT chk_reco_score CHECK (priority_score BETWEEN 0 AND 100)
) ENGINE=InnoDB;
-- ------------------------------------------------------------
 -- 9. priority_result
--    Stores the result after calculate the task assignments and examinations
--   shown on the AI Recommendations page.
-- ------------------------------------------------------------
 CREATE TABLE priority_results (

    priority_result_id INT
    AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    source_type ENUM(
      'Task',
      'Assignment',
      'Exam'
    ) NOT NULL,

    source_id INT NOT NULL,

    priority_score FLOAT NOT NULL,

    priority_level ENUM(
      'Low',
      'Medium',
      'High'
    ) NOT NULL,

    generated_at DATETIME
    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE

)ENGINE=InnoDB;
-- ------------------------------------------------------------
 -- 10. study_availability
--    Stores the estimated hour that user input 
-- ------------------------------------------------------------
CREATE TABLE study_availability(
   availability_id INT AUTO_INCREMENT PRIMARY KEY,
   user_id         INT NOT NULL,
   day_of_week ENUM('Monday' , 'Tuesday' , 'Wednesday' , 'Thursday' , 'Friday' , 'Saturday' , 'Sunday') NOT NULL,
   available_hours INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   CHECK(available_hours >=0),
   FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE

)ENGINE=InnoDB;

-- ============================================
-- Push Subscriptions
-- ============================================
CREATE TABLE push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_push_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);




-- ============================================================
--  Indexes
-- ============================================================
CREATE INDEX idx_tasks_user_status    ON tasks(user_id, status);
CREATE INDEX idx_tasks_due            ON tasks(due_date);
CREATE INDEX idx_assignments_user_due ON assignments(user_id, due_date);
CREATE INDEX idx_exams_user_date      ON examinations(user_id, exam_date);
CREATE INDEX idx_reminders_active     ON reminders(user_id, is_active);
CREATE INDEX idx_sessions_user_date   ON study_sessions(user_id, session_date);

-- ============================================================
--  Views
-- ============================================================

-- Upcoming open deadlines (tasks + assignments)
CREATE OR REPLACE VIEW vw_upcoming_deadlines AS
  SELECT 'Task' AS item_type, t.title, c.name AS course, t.due_date, t.user_id
  FROM tasks t
  LEFT JOIN courses c ON t.course_id = c.course_id
  WHERE t.status <> 'Completed'
  UNION ALL
  SELECT 'Assignment', a.title, c.name, a.due_date, a.user_id
  FROM assignments a
  LEFT JOIN courses c ON a.course_id = c.course_id
  WHERE a.status NOT IN ('Submitted','Graded');

-- Study hours by course (bar chart)
CREATE OR REPLACE VIEW vw_study_hours_by_course AS
  SELECT s.user_id, c.name AS course, c.color, SUM(s.duration) AS total_hours
  FROM study_sessions s
  LEFT JOIN courses c ON s.course_id = c.course_id
  GROUP BY s.user_id, s.course_id, c.name, c.color;

-- Task status breakdown per user (pie chart)
CREATE OR REPLACE VIEW vw_task_status_breakdown AS
  SELECT user_id, status, COUNT(*) AS total
  FROM tasks
  GROUP BY user_id, status;
