-- Create experiences table
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sensory_type TEXT NOT NULL CHECK (sensory_type IN ('visual', 'auditory', 'tactile', 'emotional', 'cognitive', 'synesthetic')),
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'ar', 'vr')),
  tags TEXT[] DEFAULT '{}',
  votes_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Policies for experiences
CREATE POLICY "Experiences are viewable by everyone" 
ON public.experiences 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create experiences" 
ON public.experiences 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own experiences" 
ON public.experiences 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own experiences" 
ON public.experiences 
FOR DELETE 
USING (auth.uid() = creator_id);

-- Create experience_votes table
CREATE TABLE public.experience_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experience_id, user_id)
);

ALTER TABLE public.experience_votes ENABLE ROW LEVEL SECURITY;

-- Policies for votes
CREATE POLICY "Users can view all votes" 
ON public.experience_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can vote on experiences" 
ON public.experience_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes" 
ON public.experience_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for experiences updated_at
CREATE TRIGGER update_experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_experience_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experiences 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.experience_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.experiences 
    SET votes_count = votes_count - 1 
    WHERE id = OLD.experience_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to update vote counts
CREATE TRIGGER on_vote_change
AFTER INSERT OR DELETE ON public.experience_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_experience_votes();