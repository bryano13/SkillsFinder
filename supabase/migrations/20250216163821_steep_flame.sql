/*
  # Add LinkedIn profile support
  
  1. Changes
    - Add `linkedin_url` column to employees table
    
  2. Notes
    - Column is nullable since not all employees might have LinkedIn profiles
    - URLs will be validated on the client side
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE employees ADD COLUMN linkedin_url text;
  END IF;
END $$;