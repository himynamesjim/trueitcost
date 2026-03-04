-- Add 'coterm-calc' to the design_type check constraint
-- Run this SQL command in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.saved_designs
DROP CONSTRAINT IF EXISTS saved_designs_design_type_check;

-- Add the new constraint with 'coterm-calc' included
ALTER TABLE public.saved_designs
ADD CONSTRAINT saved_designs_design_type_check
CHECK (design_type IN (
  'assessment',
  'ai-solution',
  'ucaas',
  'collaboration',
  'networking',
  'datacenter',
  'security',
  'bcdr',
  'coterm-calc'
));
