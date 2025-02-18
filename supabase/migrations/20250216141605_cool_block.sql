/*
  # Add avatar support for employees

  1. Changes
    - Add `avatar_url` column to `employees` table
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE employees ADD COLUMN avatar_url text;
  END IF;
END $$;