-- Fix experience_votes SELECT policy to protect user voting privacy
DROP POLICY IF EXISTS "Users can view all votes" ON public.experience_votes;

CREATE POLICY "Users can view their own votes"
ON public.experience_votes
FOR SELECT
USING (auth.uid() = user_id);

-- Add INSERT policy to user_tokens table for proper authorization
CREATE POLICY "Users can insert their own tokens"
ON public.user_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);