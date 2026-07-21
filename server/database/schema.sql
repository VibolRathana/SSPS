-- ============================================
-- Create Database
-- ============================================
CREATE DATABASE IF NOT EXISTS smart_study_planner;
USE smart_study_planner;

-- ============================================
-- Users
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin','Student') DEFAULT 'Student',
    major VARCHAR(100),
    phone VARCHAR(30),
    bio VARCHAR(255),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Courses
-- ============================================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    color VARCHAR(7) DEFAULT '#6366F1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- Tasks
-- ============================================
CREATE TABLE tasks (
<<<<<<< HEAD
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
=======
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    status ENUM('Pending','In Progress','Completed') DEFAULT 'Pending',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

    CONSTRAINT fk_task_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_task_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================
-- Assignments
-- ============================================
CREATE TABLE assignments (
<<<<<<< HEAD
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
=======
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    status ENUM('Pending','In Progress','Submitted','Graded') DEFAULT 'Pending',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

    CONSTRAINT fk_assignment_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_assignment_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================
-- Examinations
-- ============================================
CREATE TABLE examinations (
<<<<<<< HEAD
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
=======
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NULL,
    subject VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    preparation INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

    CONSTRAINT fk_exam_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_exam_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_exam_prep CHECK (preparation BETWEEN 0 AND 100)
);

-- ============================================
-- Reminders
-- ============================================
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
<<<<<<< HEAD

    CONSTRAINT fk_reminder_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
=======
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

    CONSTRAINT fk_reminder_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================
-- Study Sessions
-- ============================================
CREATE TABLE study_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NULL,
    title VARCHAR(150) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    duration DECIMAL(4,1) NOT NULL DEFAULT 1.0,
    color VARCHAR(20) DEFAULT 'indigo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_session_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_sessions_duration CHECK (duration > 0)
);

-- ============================================
-- AI Recommendations
-- ============================================
CREATE TABLE ai_recommendations (
<<<<<<< HEAD
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
=======
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    priority_score INT DEFAULT 0,
    recommended_action TEXT NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_reco_score CHECK (priority_score BETWEEN 0 AND 100)
);
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

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
<<<<<<< HEAD



=======
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

CREATE INDEX idx_tasks_user_status    ON tasks(user_id, status);
CREATE INDEX idx_tasks_due            ON tasks(due_date);
CREATE INDEX idx_assignments_user_due ON assignments(user_id, due_date);
CREATE INDEX idx_exams_user_date      ON examinations(user_id, exam_date);
CREATE INDEX idx_reminders_active     ON reminders(user_id, is_active);
CREATE INDEX idx_sessions_user_date   ON study_sessions(user_id, session_date);
