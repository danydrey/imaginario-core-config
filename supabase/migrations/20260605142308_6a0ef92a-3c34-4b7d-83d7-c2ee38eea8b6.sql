-- 1. Tighten user_tokens: remove user INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.user_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.user_tokens;

-- 2. Tighten token_transactions: remove user INSERT
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.token_transactions;

-- 3. Friendships: only recipient can update status
DROP POLICY IF EXISTS "Users can update friendship status" ON public.friendships;
CREATE POLICY "Recipient can update friendship status"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = friend_id)
  WITH CHECK (auth.uid() = friend_id);

-- 4. experience-media storage: owner-scoped UPDATE/DELETE + scoped SELECT (listing)
DROP POLICY IF EXISTS "Users can delete their own experience media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own experience media" ON storage.objects;
DROP POLICY IF EXISTS "Experience media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload experience media" ON storage.objects;

CREATE POLICY "Users can upload own experience media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'experience-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own experience media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'experience-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own experience media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'experience-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owners can list their experience media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'experience-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. avatars storage: scope listing to owner (public CDN reads still work)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Owners can list their avatars"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Revoke EXECUTE on internal helper function (already done for the others)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 7. Server-side token transfer RPC
CREATE OR REPLACE FUNCTION public.transfer_tokens(p_recipient_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender uuid := auth.uid();
  v_sender_balance integer;
  v_sender_username text;
  v_recipient_username text;
BEGIN
  IF v_sender IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_recipient_id IS NULL OR p_recipient_id = v_sender THEN
    RAISE EXCEPTION 'Invalid recipient';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT balance INTO v_sender_balance FROM public.user_tokens WHERE user_id = v_sender FOR UPDATE;
  IF v_sender_balance IS NULL OR v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Ensure recipient wallet exists
  INSERT INTO public.user_tokens (user_id, balance)
    VALUES (p_recipient_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

  SELECT username INTO v_sender_username FROM public.profiles WHERE id = v_sender;
  SELECT username INTO v_recipient_username FROM public.profiles WHERE id = p_recipient_id;
  IF v_recipient_username IS NULL THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;

  UPDATE public.user_tokens
    SET balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = now()
    WHERE user_id = v_sender;

  UPDATE public.user_tokens
    SET balance = balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = now()
    WHERE user_id = p_recipient_id;

  INSERT INTO public.token_transactions (user_id, amount, transaction_type, description, related_user_id)
    VALUES
      (v_sender, -p_amount, 'transfer_sent', 'Enviado a @' || COALESCE(v_recipient_username, ''), p_recipient_id),
      (p_recipient_id, p_amount, 'transfer_received', 'Recibido de @' || COALESCE(v_sender_username, ''), v_sender);
END;
$$;

-- user_tokens needs a unique constraint on user_id for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_tokens_user_id_key'
  ) THEN
    ALTER TABLE public.user_tokens ADD CONSTRAINT user_tokens_user_id_key UNIQUE (user_id);
  END IF;
END$$;

REVOKE EXECUTE ON FUNCTION public.transfer_tokens(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_tokens(uuid, integer) TO authenticated;

-- 8. Server-side reward redemption RPC
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance integer;
  v_cost integer;
  v_name text;
  v_type text;
  v_expires_at timestamptz;
  v_user_reward_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT cost, name, reward_type INTO v_cost, v_name, v_type
    FROM public.rewards WHERE id = p_reward_id AND is_active = true;
  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Reward not available';
  END IF;

  SELECT balance INTO v_balance FROM public.user_tokens WHERE user_id = v_user FOR UPDATE;
  IF v_balance IS NULL OR v_balance < v_cost THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  v_expires_at := CASE
    WHEN v_type = 'premium_day'   THEN now() + interval '1 day'
    WHEN v_type = 'premium_week'  THEN now() + interval '7 days'
    WHEN v_type = 'premium_month' THEN now() + interval '30 days'
    ELSE NULL
  END;

  UPDATE public.user_tokens
    SET balance = balance - v_cost,
        total_spent = total_spent + v_cost,
        updated_at = now()
    WHERE user_id = v_user;

  INSERT INTO public.token_transactions (user_id, amount, transaction_type, description)
    VALUES (v_user, -v_cost, 'spend', 'Canjeado: ' || v_name);

  INSERT INTO public.user_rewards (user_id, reward_id, expires_at)
    VALUES (v_user, p_reward_id, v_expires_at)
    RETURNING id INTO v_user_reward_id;

  RETURN v_user_reward_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated;