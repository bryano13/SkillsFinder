/*
  # Add nationality to employees

  1. Changes
    - Add `country_code` column to `employees` table
      - Uses ISO 3166-1 alpha-2 country codes (e.g., 'US', 'GB', 'FR')
      - Default value is NULL (optional field)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE employees ADD COLUMN country_code char(2);
  END IF;
END $$;