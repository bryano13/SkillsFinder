/*
  # Add Comprehensive RLS Policies

  1. Security Changes
    - Add comprehensive policies for all operations (INSERT, UPDATE, DELETE)
    - Enable proper data management for both tables
*/

-- Policies for employees table
CREATE POLICY "Enable all operations for public"
  ON employees
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for employee_skills table
CREATE POLICY "Enable all operations for public"
  ON employee_skills
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);