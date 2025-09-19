-- Update default value for replied_by column in rating_replies table
-- Change from 'admin' to 'موريسكو كافيه'

-- Update existing records that have 'admin' as replied_by
UPDATE rating_replies 
SET replied_by = 'موريسكو كافيه' 
WHERE replied_by = 'admin';

-- Update the default value for the column
ALTER TABLE rating_replies 
ALTER COLUMN replied_by SET DEFAULT 'موريسكو كافيه';
