/*
  # Add Udemy certifications support

  1. New Tables
    - `employee_certifications`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `title` (text) - The certification title
      - `udemy_url` (text) - The Udemy certificate URL
      - `completed_at` (timestamptz) - When the certification was completed
      - `created_at` (timestamptz) - When the record was created

  2. Security
    - Enable RLS on `employee_certifications` table
    - Add policy for public access (matching the employees table policy)
*/

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

-- Create policies
CREATE POLICY "Enable all operations for public"
  ON employee_certifications
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);