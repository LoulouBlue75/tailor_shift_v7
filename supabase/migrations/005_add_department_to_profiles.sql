-- Add department column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department VARCHAR(50);

-- Add check constraint for valid departments
ALTER TABLE profiles
ADD CONSTRAINT check_valid_department 
CHECK (department IN ('direction', 'hr', 'operations', 'business'));

-- Add comment
COMMENT ON COLUMN profiles.department IS 'Department for brand users (direction, hr, operations, business)';