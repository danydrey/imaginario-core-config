
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  emotion text,
  sense text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colecciones visibles para todos" ON public.collections FOR SELECT USING (true);

CREATE TABLE public.collection_experiences (
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, experience_id)
);
GRANT SELECT ON public.collection_experiences TO anon, authenticated;
GRANT ALL ON public.collection_experiences TO service_role;
ALTER TABLE public.collection_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Relaciones visibles para todos" ON public.collection_experiences FOR SELECT USING (true);

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed de colecciones iniciales
INSERT INTO public.collections (slug, title, description, emotion, sense) VALUES
  ('aromas-de-colombia', 'Aromas de Colombia', 'Un viaje por los olores que definen un territorio: café recién tostado, lluvia sobre tierra caliente, flores de los Andes.', 'Nostalgia', 'olfato'),
  ('sonidos-del-agua', 'Sonidos del agua', 'Ríos, mares, lluvias y silencios húmedos. Una colección para escuchar con los ojos cerrados.', 'Serenidad', 'auditivo'),
  ('rutas-del-cafe', 'Rutas del café', 'Sabores, texturas y rituales en torno a la bebida que mueve mañanas enteras.', 'Contemplación', 'gusto'),
  ('luz-de-los-andes', 'Luz de los Andes', 'Atardeceres, neblinas y paisajes que se quedan en la memoria.', 'Asombro', 'visual'),
  ('tactos-de-la-infancia', 'Tactos de la infancia', 'Texturas que devuelven recuerdos: arena, lana, tierra mojada, manos conocidas.', 'Nostalgia', 'tacto');
