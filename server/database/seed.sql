-- ============================================================
--  Smart Study Planner System — Seed Data
--  Run AFTER schema.sql
--
--  Demo passwords (bcrypt-hashed):
--    Admin accounts  →  same hash as Rathana (password known to dev)
--    Student demo    →  same hash as Rathana for easy testing
-- ============================================================
USE smart_study_planner;

-- ============================================================
-- 1. USERS
-- ============================================================

-- Admin accounts
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('Rathana',  'rathana@ssps.com',  '$2b$10$sO0ovwuS9cVjtcijFst9pekzD3TS7lV4V.vd27xSl8BNtb4/uOpru', 'Admin'),
  ('Tola',     'tola@ssps.com',     '$2b$10$mtfkdSyZVuq2muiRy9E0h.hqtqMsPoBuPTmGEWQrS7EGxTRnpSAu.', 'Admin'),
  ('Molika',   'molika@ssps.com',   '$2b$10$FaPTilH/Z0oq1EdrhcnRI.GvtaeOz2lF/aeu2./VYNzmgtlXGmDCO', 'Admin');

-- Demo student accounts (user_id 4 and 5)
INSERT INTO users (full_name, email, password_hash, role, major, phone, bio) VALUES
  ('Dara Chan',  'dara@ssps.com',   '$2b$10$sO0ovwuS9cVjtcijFst9pekzD3TS7lV4V.vd27xSl8BNtb4/uOpru', 'Student', 'Computer Science',    '012 345 678', 'Final year CS student preparing for semester exams.'),
  ('Sreyna Keo', 'sreyna@ssps.com', '$2b$10$sO0ovwuS9cVjtcijFst9pekzD3TS7lV4V.vd27xSl8BNtb4/uOpru', 'Student', 'Information Technology', '098 765 432', 'IT student focused on web and mobile development.');

-- ============================================================
-- 2. COURSES  (for both demo students)
-- ============================================================

-- Dara's courses (user_id = 4)
INSERT INTO courses (user_id, name, code, color) VALUES
  (4, 'Data Structures',        'CS201', '#6366F1'),
  (4, 'Database Systems',       'CS301', '#F59E0B'),
  (4, 'Web Development',        'CS302', '#10B981'),
  (4, 'Operating Systems',      'CS303', '#EF4444');

-- Sreyna's courses (user_id = 5)
INSERT INTO courses (user_id, name, code, color) VALUES
  (5, 'Network Fundamentals',   'IT201', '#6366F1'),
  (5, 'Software Engineering',   'IT301', '#8B5CF6'),
  (5, 'Mobile Development',     'IT302', '#F59E0B');

-- ============================================================
-- 3. TASKS
-- ============================================================

-- Dara's tasks
INSERT INTO tasks (user_id, course_id, title, description, priority, status, due_date) VALUES
  (4, 1, 'Implement Binary Search Tree',  'Code BST with insert, delete, search operations', 'High',   'In Progress', '2026-07-05'),
  (4, 1, 'Graph Algorithm Assignment',    'BFS and DFS traversal on adjacency list',          'High',   'Pending',     '2026-07-12'),
  (4, 2, 'ER Diagram for Hotel System',   'Design a full ER diagram and normalise to 3NF',    'Medium', 'Pending',     '2026-07-08'),
  (4, 2, 'SQL Query Practice',            'Write 20 advanced SQL queries from lecture slides', 'Medium', 'Completed',   '2026-06-20'),
  (4, 3, 'Build REST API with Node.js',   'CRUD endpoints for a todo app using Express',       'High',   'In Progress', '2026-07-10'),
  (4, 4, 'Process Scheduling Report',     'Compare Round Robin vs Priority Scheduling',        'Low',    'Pending',     '2026-07-18');

-- Sreyna's tasks
INSERT INTO tasks (user_id, course_id, title, description, priority, status, due_date) VALUES
  (5, 5, 'Subnet Mask Calculation',       'Calculate subnets for given IP ranges',             'Medium', 'Completed',   '2026-06-22'),
  (5, 6, 'Use Case Diagram',              'Draw use case diagram for e-commerce system',       'High',   'In Progress', '2026-07-06'),
  (5, 7, 'Flutter Login Screen',          'Implement login UI with form validation',            'High',   'Pending',     '2026-07-09');

-- ============================================================
-- 4. ASSIGNMENTS
-- ============================================================

-- Dara's assignments
INSERT INTO assignments (user_id, course_id, title, description, priority, status, due_date) VALUES
  (4, 1, 'Data Structures Mid-term Project', 'Implement a full stack using linked list',       'High',   'In Progress', '2026-07-15'),
  (4, 2, 'Database Design Report',           '10-page report on relational vs NoSQL databases','Medium', 'Pending',     '2026-07-20'),
  (4, 3, 'Full Stack Web App',               'Build a complete CRUD app with React + Node',    'High',   'Pending',     '2026-07-25'),
  (4, 4, 'OS Lab Report',                    'Document results of virtual memory experiment',  'Low',    'Submitted',   '2026-06-18');

-- Sreyna's assignments
INSERT INTO assignments (user_id, course_id, title, description, priority, status, due_date) VALUES
  (5, 5, 'Network Topology Design',    'Design and simulate a LAN topology using Packet Tracer', 'High',   'Pending',     '2026-07-14'),
  (5, 6, 'Software Requirements Spec', 'Write an SRS document for a library management system',   'High',   'In Progress', '2026-07-18'),
  (5, 7, 'Mobile App Prototype',       'Build a working prototype of a food delivery app',        'Medium', 'Pending',     '2026-07-28');

-- ============================================================
-- 5. EXAMINATIONS
-- ============================================================

-- Dara's exams
INSERT INTO examinations (user_id, course_id, subject, exam_date, preparation) VALUES
  (4, 1, 'Data Structures Final',   '2026-07-28', 45),
  (4, 2, 'Database Systems Final',  '2026-07-30', 30),
  (4, 3, 'Web Development Final',   '2026-08-02', 20),
  (4, 4, 'Operating Systems Final', '2026-08-05', 15);

-- Sreyna's exams
INSERT INTO examinations (user_id, course_id, subject, exam_date, preparation) VALUES
  (5, 5, 'Network Fundamentals Final', '2026-07-29', 50),
  (5, 6, 'Software Engineering Final', '2026-08-01', 35),
  (5, 7, 'Mobile Development Final',   '2026-08-04', 25);

-- ============================================================
-- 6. STUDY SESSIONS  (schedule page data for Dara)
-- ============================================================
INSERT INTO study_sessions (user_id, course_id, title, session_date, start_time, duration, color) VALUES
  (4, 1, 'BST Implementation Practice',  '2026-06-26', '08:00', 2.0, 'indigo'),
  (4, 2, 'SQL Query Practice',           '2026-06-26', '14:00', 1.5, 'orange'),
  (4, 3, 'React Component Review',       '2026-06-27', '09:00', 2.0, 'green'),
  (4, 1, 'Graph Algorithms Study',       '2026-06-28', '10:00', 2.5, 'indigo'),
  (4, 2, 'ER Diagram Revision',          '2026-06-29', '08:30', 1.5, 'orange'),
  (4, 4, 'Process Scheduling Study',     '2026-06-30', '13:00', 2.0, 'red'),
  (4, 1, 'Data Structures Exam Prep',    '2026-07-01', '09:00', 3.0, 'purple');

-- ============================================================
-- 7. REMINDERS
-- ============================================================
INSERT INTO reminders (user_id, reminder_type, description, remind_date, remind_time, notify_before) VALUES
  (4, 'Assignment', 'Submit Data Structures Mid-term Project', '2026-07-15', '08:00', '1 day'),
  (4, 'Exam',       'Data Structures Final Exam tomorrow',     '2026-07-27', '20:00', '1 day'),
  (4, 'Task',       'Complete BST implementation',             '2026-07-05', '07:00', '1 hour'),
  (5, 'Assignment', 'Submit Network Topology Design',          '2026-07-14', '08:00', '1 day'),
  (5, 'Exam',       'Network Fundamentals Final Exam',         '2026-07-28', '20:00', '1 day');

-- ============================================================
-- 8. AI RECOMMENDATIONS  (one saved plan per demo student)
-- ============================================================
INSERT INTO ai_recommendations (user_id, priority_score, recommended_action) VALUES
  (4, 0, '## Study Plan for Dara\n\n**Immediate priorities:**\n- Complete the BST implementation — due in 10 days, currently in progress\n- Start the Full Stack Web App assignment — high priority, due in 30 days\n\n**This week:**\n1. Finish BST insert/delete/search (2–3 hours)\n2. Begin ER Diagram for Hotel System (due 8 Jul)\n3. Review SQL queries for Database Systems exam prep\n\n**Exam preparation (starting now):**\n- Data Structures: focus on trees, graphs, sorting algorithms\n- Database Systems: practice normalisation and query optimisation\n\n**Tip:** Schedule 2-hour focused blocks in the morning when concentration is highest.'),
  (5, 0, '## Study Plan for Sreyna\n\n**Immediate priorities:**\n- Finish Use Case Diagram — high priority, due in 11 days\n- Complete Flutter Login Screen — due in 14 days\n\n**This week:**\n1. Complete the Use Case Diagram for e-commerce system\n2. Start SRS document outline for Software Engineering assignment\n3. Review Flutter widget basics before starting the login screen\n\n**Exam preparation:**\n- Network Fundamentals: review subnetting, routing protocols, OSI model\n- Software Engineering: focus on SDLC, UML diagrams, and design patterns\n\n**Tip:** Group similar subjects together — study networking and mobile on alternating days to avoid fatigue.');
