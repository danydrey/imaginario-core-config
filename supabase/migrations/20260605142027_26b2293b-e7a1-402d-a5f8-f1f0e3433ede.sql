CREATE OR REPLACE FUNCTION public.update_experience_votes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Not authorized to vote as another user';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.experiences WHERE id = NEW.experience_id) THEN
      RAISE EXCEPTION 'Experience does not exist';
    END IF;
    UPDATE public.experiences SET votes_count = votes_count + 1 WHERE id = NEW.experience_id;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Not authorized to remove another user''s vote';
    END IF;
    UPDATE public.experiences SET votes_count = GREATEST(votes_count - 1, 0) WHERE id = OLD.experience_id;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_username text;
  candidate text;
  suffix int := 0;
BEGIN
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  candidate := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    suffix := suffix + 1;
    candidate := base_username || '_' || suffix::text;
    IF suffix > 1000 THEN
      candidate := base_username || '_' || substr(NEW.id::text, 1, 8);
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO public.profiles (id, username) VALUES (NEW.id, candidate);
  INSERT INTO public.user_tokens (user_id, balance) VALUES (NEW.id, 100);
  RETURN NEW;
END;
$function$;