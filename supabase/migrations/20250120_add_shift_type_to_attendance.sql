-- Add shift_type column to attendance table
ALTER TABLE attendance 
ADD COLUMN shift_type VARCHAR(20) DEFAULT 'morning' CHECK (shift_type IN ('morning', 'evening', 'both'));

-- Add index for better performance
CREATE INDEX idx_attendance_shift_type ON attendance(shift_type);

-- Add comment to explain the column
COMMENT ON COLUMN attendance.shift_type IS 'Type of shift: morning, evening, or both (for double wage)';
