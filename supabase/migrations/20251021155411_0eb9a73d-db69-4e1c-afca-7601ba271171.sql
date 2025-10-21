-- Drop the old constraint
ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_sensory_type_check;

-- Add new constraint with correct Spanish values
ALTER TABLE public.experiences ADD CONSTRAINT experiences_sensory_type_check 
CHECK (sensory_type IN ('visual', 'auditivo', 'tacto', 'olfato', 'gusto'));