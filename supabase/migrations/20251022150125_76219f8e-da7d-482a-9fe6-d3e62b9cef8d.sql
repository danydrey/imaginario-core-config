-- Add social media links to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Create token_transactions table for tracking token history
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'transfer_sent', 'transfer_received')),
  description TEXT NOT NULL,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);

-- Enable RLS on token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for token_transactions
CREATE POLICY "Users can view their own transactions"
ON public.token_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
ON public.token_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships
CREATE POLICY "Users can view their own friendships"
ON public.friendships
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests"
ON public.friendships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendship status"
ON public.friendships
FOR UPDATE
USING (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own friendships"
ON public.friendships
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK (cost > 0),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('feature_experience', 'badge', 'premium_day', 'premium_week', 'premium_month')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rewards
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- RLS policy for rewards (everyone can view active rewards)
CREATE POLICY "Everyone can view active rewards"
ON public.rewards
FOR SELECT
USING (is_active = true);

-- Create user_rewards table to track redeemed rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);

-- Enable RLS on user_rewards
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_rewards
CREATE POLICY "Users can view their own rewards"
ON public.user_rewards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
ON public.user_rewards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger to update friendships updated_at
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial rewards
INSERT INTO public.rewards (name, description, cost, reward_type) VALUES
('Destacar Experiencia', 'Destaca una de tus experiencias en la página principal por 24 horas', 50, 'feature_experience'),
('Badge Explorador', 'Obtén el badge de Explorador Sensorial en tu perfil', 100, 'badge'),
('Premium por 1 Día', 'Acceso Premium por 24 horas con funciones exclusivas', 150, 'premium_day'),
('Premium por 1 Semana', 'Acceso Premium por 7 días con funciones exclusivas', 500, 'premium_week'),
('Premium por 1 Mes', 'Acceso Premium por 30 días con funciones exclusivas', 1500, 'premium_month')
ON CONFLICT DO NOTHING;

-- Create storage buckets for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage buckets for experience media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('experience-media', 'experience-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for experience-media bucket
CREATE POLICY "Experience media is publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'experience-media');

CREATE POLICY "Authenticated users can upload experience media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'experience-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own experience media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'experience-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own experience media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'experience-media' 
  AND auth.role() = 'authenticated'
);