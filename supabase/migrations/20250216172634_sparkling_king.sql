/*
  # Add employee certifications table

  1. New Tables
    - `employee_certifications`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `title` (text)
      - `udemy_url` (text)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `employee_certifications` table
*/

-- Create the employee_certifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS employee_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  udemy_url text NOT NULL,
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Enable all operations for public" ON employee_certifications;

-- Create new policy
CREATE POLICY "Enable all operations for public"
  ON employee_certifications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);