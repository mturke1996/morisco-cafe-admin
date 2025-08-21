-- Clean up duplicate shift closures and fix expense clearing
-- This migration will:
-- 1. Remove duplicate shift closures for the same date and shift type
-- 2. Ensure expenses are properly cleared after shift closure

-- First, let's identify and remove duplicate shift closures
-- Keep only the most recent one for each date/shift_type combination
WITH duplicate_shifts AS (
  SELECT 
    id,
    shift_date,
    shift_type,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY shift_date, shift_type 
      ORDER BY created_at DESC
    ) as rn
  FROM shift_closures
)
DELETE FROM shift_closures 
WHERE id IN (
  SELECT id 
  FROM duplicate_shifts 
  WHERE rn > 1
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE shift_closures 
ADD CONSTRAINT unique_shift_date_type 
UNIQUE (shift_date, shift_type);

-- Create a function to properly clear expenses after shift closure
CREATE OR REPLACE FUNCTION clear_expenses_after_shift_closure()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete expenses for the shift date from the main expenses table
  DELETE FROM expenses 
  WHERE date = NEW.shift_date;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clear expenses when shift is closed
DROP TRIGGER IF EXISTS trigger_clear_expenses_after_shift_closure ON shift_closures;
CREATE TRIGGER trigger_clear_expenses_after_shift_closure
  AFTER INSERT ON shift_closures
  FOR EACH ROW
  EXECUTE FUNCTION clear_expenses_after_shift_closure();

-- Add index for better performance on date-based queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_shift_closures_date_type ON shift_closures(shift_date, shift_type);
