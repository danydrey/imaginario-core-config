-- Remove existing sensory_type check constraint if it exists
ALTER TABLE public.experiences 
DROP CONSTRAINT IF EXISTS sensory_type_check;

-- Add new check constraint with correct Spanish values
ALTER TABLE public.experiences
ADD CONSTRAINT sensory_type_check 
CHECK (sensory_type IN ('visual', 'auditivo', 'tacto', 'olfato', 'gusto'));