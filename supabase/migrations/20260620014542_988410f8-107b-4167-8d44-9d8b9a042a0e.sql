DO $$ DECLARE r record; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='experiences' AND cmd='UPDATE' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.experiences', r.policyname); END LOOP; END $$;

CREATE OR REPLACE FUNCTION public.prevent_featured_self_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
    NEW.is_featured := OLD.is_featured;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.prevent_featured_self_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_featured_self_update ON public.experiences;
CREATE TRIGGER trg_prevent_featured_self_update
BEFORE UPDATE ON public.experiences FOR EACH ROW
EXECUTE FUNCTION public.prevent_featured_self_update();

CREATE POLICY "Users can update own experiences"
ON public.experiences FOR UPDATE TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);