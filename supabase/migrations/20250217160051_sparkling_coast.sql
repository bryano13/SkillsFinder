/*
  # Add skill ratings support

  1. Changes
    - Add skill_ratings JSONB column to employees table to store skill proficiency levels
    
  2. Notes
    - Uses JSONB to store flexible key-value pairs of skills and their ratings
    - Default rating is 3 (mid-level) if not specified
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'skill_ratings'
  ) THEN
    ALTER TABLE employees ADD COLUMN skill_ratings JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update existing employees with default skill ratings
UPDATE employees
SET skill_ratings = (
  SELECT jsonb_object_agg(skill, 3)
  FROM employee_skills
  WHERE employee_skills.employee_id = employees.id
)
WHERE skill_ratings IS NULL OR skill_ratings = '{}'::jsonb;