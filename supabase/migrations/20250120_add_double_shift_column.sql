-- Add simple double shift column to attendance table
ALTER TABLE attendance 
ADD COLUMN is_double_shift BOOLEAN DEFAULT FALSE;

-- Add index for better performance
CREATE INDEX idx_attendance_double_shift ON attendance(is_double_shift);

-- Add comment to explain the column
COMMENT ON COLUMN attendance.is_double_shift IS 'True if employee worked both shifts (morning + evening)';
