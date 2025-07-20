-- Fix RLS policies for voters table to allow proper authentication flow

-- Allow public to read voter status to check if already voted
CREATE POLICY "Allow public to check voter status" 
ON public.voters 
FOR SELECT 
USING (true);

-- Update the existing insert policy to be more permissive
DROP POLICY IF EXISTS "Allow insert for public" ON public.voters;

CREATE POLICY "Allow public to insert voter records" 
ON public.voters 
FOR INSERT 
WITH CHECK (true);

-- Allow updating vote status after authentication
CREATE POLICY "Allow public to update votes" 
ON public.voters 
FOR UPDATE 
USING (true);