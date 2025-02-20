-- Admin Table
CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(140) NOT NULL
);

-- Category Table
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL
);

-- Employee Table
CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  salary NUMERIC(10,2) NOT NULL,
  image VARCHAR(255),
  category_id INT REFERENCES category(id) ON DELETE SET NULL
);

-- Clock Records Table (Attendance)
CREATE TABLE clock_records (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employee(id) ON DELETE CASCADE,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  location VARCHAR(255),
  work_from_type VARCHAR(50)  -- e.g., office, home, remote, etc.
);

-- Office Locations Table
CREATE TABLE office_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address VARCHAR(255)
);

-- ================================
-- 2. New Tables (Project Management Tool - PMT)
-- ================================

-- Clients Table: Stores client details.
CREATE TABLE clients (
  client_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150),
  email VARCHAR(150),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table: Stores project details.
CREATE TABLE projects (
  project_id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  created_by INT REFERENCES admin(id) ON DELETE SET NULL,  -- admin who created the project
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'Not Started',  -- Not Started, In Progress, On Hold, Completed, Canceled
  completion_date TIMESTAMP,
  start_date TIMESTAMP,
  priority VARCHAR(20) DEFAULT 'Medium',  -- Low, Medium, High, Urgent
  client_id INT REFERENCES clients(client_id) ON DELETE SET NULL
);

-- Tasks Table: Stores tasks associated with projects.
CREATE TABLE tasks (
  task_id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  deadline TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, in_progress, completed
  project_id INT REFERENCES projects(project_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Assignments Table (Optional): To handle many-to-many relationship between employees and tasks.
-- Use this if a task may be assigned to multiple employees or if you want a separate assignment record.
CREATE TABLE task_assignments (
  id SERIAL PRIMARY KEY,
  task_id INT REFERENCES tasks(task_id) ON DELETE CASCADE,
  employee_id INT REFERENCES employee(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table (Optional): For real-time alerts related to tasks.
CREATE TABLE notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES employee(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);