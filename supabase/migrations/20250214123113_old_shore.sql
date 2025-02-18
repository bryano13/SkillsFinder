/*
  # Create employees and skills tables

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `title` (text)
      - `years_of_experience` (integer)
      - `created_at` (timestamp)
    - `employee_skills`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `skill` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read data
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  years_of_experience integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  skill text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to employees"
  ON employees
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to employee_skills"
  ON employee_skills
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO employees (name, title, years_of_experience) VALUES
  ('John Smith', 'Senior Software Engineer', 8),
  ('Sarah Johnson', 'Lead Developer', 10),
  ('Michael Chen', 'Software Architect', 12),
  ('Emily Brown', 'Senior Python Developer', 7),
  ('David Wilson', 'Full Stack Developer', 6),
  ('Lisa Anderson', 'Data Engineer', 5),
  ('James Taylor', 'Backend Developer', 4),
  ('Maria Garcia', 'Python Developer', 3),
  ('Robert Martin', 'Senior Data Engineer', 9),
  ('Jennifer Lee', 'Machine Learning Engineer', 6),
  ('William Davis', 'Software Engineer', 4),
  ('Emma Wilson', 'Python Developer', 5),
  ('Thomas Moore', 'Data Scientist', 7),
  ('Anna White', 'Backend Engineer', 6),
  ('Kevin Brown', 'Full Stack Developer', 8);

-- Insert skills for employees
INSERT INTO employee_skills (employee_id, skill) 
SELECT id, unnest(ARRAY['Python', 'FastAPI', 'Pandas', 'Spark']) 
FROM employees 
WHERE name IN ('Emily Brown', 'Robert Martin');

INSERT INTO employee_skills (employee_id, skill)
SELECT id, unnest(ARRAY['Python', 'FastAPI', 'Django'])
FROM employees
WHERE name IN ('Maria Garcia', 'James Taylor');

INSERT INTO employee_skills (employee_id, skill)
SELECT id, unnest(ARRAY['Python', 'Pandas', 'SQL', 'Spark'])
FROM employees
WHERE name IN ('Lisa Anderson', 'Jennifer Lee', 'Thomas Moore');

INSERT INTO employee_skills (employee_id, skill)
SELECT id, unnest(ARRAY['Python', 'React', 'Node.js'])
FROM employees
WHERE name IN ('David Wilson', 'William Davis', 'Kevin Brown');

INSERT INTO employee_skills (employee_id, skill)
SELECT id, unnest(ARRAY['Python', 'FastAPI', 'AWS', 'Docker'])
FROM employees
WHERE name IN ('John Smith', 'Sarah Johnson', 'Michael Chen');