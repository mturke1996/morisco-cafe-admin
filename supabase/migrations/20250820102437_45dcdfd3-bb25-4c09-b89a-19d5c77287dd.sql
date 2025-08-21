
-- Add missing columns to attendance table for wage calculations
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS daily_wage_earned numeric DEFAULT 0;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS deduction_amount numeric DEFAULT 0;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS bonus_amount numeric DEFAULT 0;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS early_departure boolean DEFAULT false;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS deduction_reason text;

-- Create function to calculate daily wage when marking attendance
CREATE OR REPLACE FUNCTION calculate_daily_wage()
RETURNS trigger AS $$
DECLARE
    employee_wage numeric := 0;
BEGIN
    -- Get employee's daily wage from employee_profiles
    SELECT COALESCE(daily_wage, 0) INTO employee_wage
    FROM employee_profiles 
    WHERE employee_id = NEW.employee_id;
    
    -- If no profile exists, use salary/30 from employees table
    IF employee_wage = 0 THEN
        SELECT COALESCE(salary / 30, 0) INTO employee_wage
        FROM employees 
        WHERE id = NEW.employee_id;
    END IF;
    
    -- Set the daily wage earned for present employees
    IF NEW.status = 'present' THEN
        NEW.daily_wage_earned := employee_wage;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate daily wage
DROP TRIGGER IF EXISTS calculate_wage_trigger ON attendance;
CREATE TRIGGER calculate_wage_trigger
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_wage();

-- Create or update employee profile when employee is created
CREATE OR REPLACE FUNCTION create_employee_profile()
RETURNS trigger AS $$
BEGIN
    INSERT INTO employee_profiles (employee_id, daily_wage, monthly_withdrawals, total_work_hours)
    VALUES (NEW.id, COALESCE(NEW.salary / 30, 0), 0, 0)
    ON CONFLICT (employee_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for employee profile creation
DROP TRIGGER IF EXISTS create_profile_trigger ON employees;
CREATE TRIGGER create_profile_trigger
    AFTER INSERT ON employees
    FOR EACH ROW
    EXECUTE FUNCTION create_employee_profile();
