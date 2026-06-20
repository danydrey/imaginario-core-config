
# Rediseño estratégico de i-Maginar

Transformar i-Maginar de "red social de contenido" a **ecosistema sensorial humano**. Dado el alcance, propongo ejecutarlo en **5 fases incrementales** para no romper lo que ya funciona ni gastar créditos en una sola reescritura masiva.

---

## Fase 1 — Nueva identidad visual (base del rediseño)

Esto se siente inmediatamente en toda la app sin tocar lógica.

- Reemplazar paleta cálida actual (naranjas/coral) por la nueva paleta contemplativa:
  - Crema `#F8F4ED`, Verde bosque `#4F6F52`, Azul profundo `#355C7D`, Arena `#D9C7A3`, Terracota `#C97C5D`.
- Tipografía: par editorial/orgánico (display serif + sans humanista), no Inter/Poppins.
- Quitar glassmorphism agresivo y gradientes vibrantes. Usar texturas suaves, mucho aire, transiciones lentas.
- Actualizar `index.css`, `tailwind.config.ts`, Hero, Navbar, Cards.
- Microcopy: cambiar "publicaciones / likes / seguidores" por "experiencias / resonancias / conexiones".

## Fase 2 — Reconceptualizar Inicio y Experiencias

- **Home** deja de ser feed. Se convierte en "Atlas Sensorial": secciones por emoción (Serenidad, Inspiración, Nostalgia, Asombro, Energía, Contemplación) y por sentido.
- **ExperienceCard** rediseñada: ubicación, sentidos involucrados como iconos, emoción dominante, audio embebido visible.
- Pregunta guía en Home: *"¿Qué estás experimentando?"* en vez de "¿Qué hay de nuevo?".
- Sistema de reacciones nuevo: ✨ Resonó · 🌿 Me inspiró · 💭 Me hizo recordar · 🫶 Lo sentí · 🔖 Quiero vivirlo.
  - Requiere migración: tabla `experience_reactions` con tipo enum (reemplaza `experience_votes`), o extender la actual con columna `reaction_type`.

## Fase 3 — Crear experiencia enriquecida + Audio protagonista

- Formulario de creación rediseñado en pasos: Título → Ubicación → Sentidos (multi) → Emoción → Media (foto/video + **audio ambiental opcional**) → Descripción sensorial por sentido.
- Subida de audio (bucket ya existe) con reproductor visualmente destacado (waveform).
- Aviso de derechos/copyright para música.

## Fase 4 — Perfiles sensoriales + Mapa sensorial funcional

- **Perfil**: foto, bio, links de redes (campos nuevos en `profiles`), emociones predominantes calculadas, sentidos más usados, intereses (tags).
- **Mapa sensorial**: agrupar experiencias por territorio + emoción dominante. Reusar `SensoryMapChart` y añadir vista por regiones.
- Botón "Conectar" + invitaciones de amistad (ya hay `friendships`, falta UI clara).
- Botón volver / navegación contextual.

## Fase 5 — Diario sensorial + IA curadora + Colecciones

- **Diario sensorial**: vista personal con timeline, mapa emocional del año, top lugares/emociones (agregaciones SQL sobre experiencias propias).
- **Colecciones temáticas**: Aromas de Colombia, Sonidos del Agua, Rutas del Café, etc. Tabla `collections` + relación N:M con experiencias.
- **IA curadora** (Lovable AI Gateway, `google/gemini-3-flash-preview`): edge function que analiza una experiencia y devuelve emoción/sentidos sugeridos + recomendaciones de experiencias afines.
- Sistema de tokens existente se mantiene pero renombrado conceptualmente ("semillas" o similar) — opcional.

---

## Detalles técnicos

- Stack actual (React + Vite + Tailwind + Supabase/Lovable Cloud) se mantiene.
- Migraciones necesarias:
  - `profiles`: añadir `bio_extendida`, `social_links jsonb`, `intereses text[]`.
  - Nueva tabla `experience_reactions(id, experience_id, user_id, reaction_type, created_at)` con RLS + GRANTs.
  - Nueva tabla `collections(id, slug, title, emotion, sense, cover_url)` + `collection_experiences(collection_id, experience_id)`.
  - Vista o RPC para perfil agregado (emociones top, sentidos top).
- Edge function nueva: `curate-experience` (IA).
- Toda nueva tabla con RLS + GRANT obligatorios.

---

## Pregunta antes de arrancar

El alcance completo son **5 fases grandes**. Para no gastar muchos créditos de golpe te propongo:

**Opción A** — Arrancar solo con **Fase 1 (identidad visual)** ahora. Es lo que más cambia la percepción y es barato. Luego decides si seguimos.

**Opción B** — Hacer **Fase 1 + Fase 2** (visual + reconcepto de Home/Experiencias/reacciones). Es el salto cualitativo más fuerte.

**Opción C** — Ejecutar todo el plan completo (5 fases) en sucesión. Más costoso en créditos.

Respóndeme **A**, **B** o **C** y arranco.
