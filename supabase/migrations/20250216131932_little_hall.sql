/*
  # Add Insert Policies

  1. Security Changes
    - Add INSERT policies for employees and employee_skills tables
    - Allow public to insert new employees and their skills
*/

-- Add insert policies for employees
CREATE POLICY "Allow public insert access to employees"
  ON employees
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add insert policies for employee_skills
CREATE POLICY "Allow public insert access to employee_skills"
  ON employee_skills
  FOR INSERT
  TO public
  WITH CHECK (true);