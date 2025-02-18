/*
  # Add favorites functionality

  1. New Tables
    - `employee_favorites`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `employee_favorites` table
    - Add policies for public access
*/

CREATE TABLE IF NOT EXISTS employee_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employee_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all operations for public"
  ON employee_favorites
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);