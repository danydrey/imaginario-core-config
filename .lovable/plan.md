
# Diagnóstico: qué le falta a Imaginar para funcionar "full"

## Estado actual (lo que ya funciona)

- Autenticación (registro, login, recuperación y reset de contraseña).
- Creación de experiencias con subida de foto/video/audio.
- Feed principal, exploración, votos/resonancias, perfiles, amistades.
- Sistema de tokens (transferencias, canjes vía RPC).
- Mapa sensorial, colecciones temáticas, diario y curador IA (Fase 5).
- Emails de auth por defecto (plantillas genéricas de Lovable).

---

## Lo que le falta para estar "full"

### 1. Emails con marca propia
Hoy los correos de registro/recuperación se envían con plantilla genérica y remitente por defecto. Falta:
- Configurar un dominio de envío propio (ej. `notify@imaginar.app`).
- Plantillas HTML con logo, paleta contemplativa y tono editorial de Imaginar.
- Aplica a: confirmación de cuenta, recuperación, magic link, cambio de email.

### 2. Panel de administración interno
No existe un backoffice dentro de la app. Falta:
- Tabla `user_roles` + enum `app_role` (`admin`, `moderator`, `user`) con RLS y función `has_role()` (SECURITY DEFINER).
- Ruta `/admin` protegida por rol.
- Vistas para: moderar experiencias (ocultar/destacar), gestionar usuarios (banear/roles), revisar reportes, curar colecciones, ver métricas básicas.

### 3. Sistema de reportes / moderación
Hoy cualquier contenido publicado queda visible sin control. Falta:
- Botón "Reportar" en cada experiencia y perfil.
- Tabla `reports` (contenido, motivo, estado, moderador).
- Cola de revisión en el panel admin.

### 4. Notificaciones in-app
No hay ninguna notificación cuando alguien resuena, comenta, te sigue o te envía tokens/solicitud de amistad. Falta:
- Tabla `notifications` + realtime.
- Campana en Navbar con contador.
- Página `/notificaciones`.

### 5. Comentarios / conversación en experiencias
Solo hay reacciones. Falta capa de conversación:
- Tabla `experience_comments` con RLS.
- UI de hilo bajo cada experiencia.

### 6. Búsqueda real
No hay buscador global. Falta:
- Índice full-text en `experiences` (título, descripción, tags) y `profiles`.
- Barra de búsqueda en Navbar con resultados agrupados.

### 7. Onboarding + verificación de email obligatoria
Hoy se puede entrar sin verificar. Falta:
- Bloquear acciones (crear experiencia, transferir tokens) hasta verificar email.
- Flujo de onboarding guiado tras el registro (elegir sentidos favoritos, intereses, primera experiencia).

### 8. SEO y metadata social
`index.html` posiblemente tenga metadata débil. Falta:
- Title/description por página con `react-helmet-async`.
- Open Graph e imagen social por experiencia.
- Sitemap y `robots.txt` afinados.

### 9. Legales
Sin esto no debería salir a producción abierta:
- Página de Términos y Condiciones.
- Política de Privacidad.
- Política de Copyright (importante por los audios/música).
- Checkbox de aceptación en el registro.

### 10. Analítica y errores
- Integrar analytics (visitas, eventos clave: crear, resonar, canjear).
- Captura de errores (por ejemplo Sentry o el propio panel de Cloud).

### 11. Rendimiento y accesibilidad
- Paginación / scroll infinito en el feed (hoy limita a 12).
- Lazy loading de imágenes y audios.
- Revisión de contraste, foco visible y navegación por teclado.
- Estados vacíos y de error consistentes.

### 12. Mobile / PWA
- Revisar responsive fino (menú móvil del Navbar hoy oculta enlaces).
- Manifest + service worker para instalable como PWA.

---

## Detalles técnicos (referencia)

- Roles: `user_roles(user_id uuid, role app_role)` + `has_role(uuid, app_role)` `SECURITY DEFINER`. Nunca guardar rol en `profiles`.
- Reportes: `reports(id, reporter_id, target_type, target_id, reason, status, resolved_by, created_at)` con RLS: insert por autenticados, select solo admin/moderator.
- Notificaciones: `notifications(id, user_id, type, payload jsonb, read_at, created_at)` + Realtime channel filtrado por `user_id`.
- Comentarios: `experience_comments(id, experience_id, author_id, body, created_at)` con RLS de lectura pública / escritura del autor.
- Búsqueda: columna `tsvector` generada + índice GIN.
- Emails de marca: `scaffold_auth_email_templates` + plantillas en `_shared/email-templates/`.
- Todas las tablas nuevas: `GRANT` explícito + RLS + policies.

---

## Cómo priorizarlo

Sugiero agrupar por "release":

- **Release 1 – Confianza mínima para abrir al público**: emails con marca (1) + legales (9) + verificación de email (7) + reportes (3).
- **Release 2 – Operación diaria**: panel admin (2) + notificaciones (4) + comentarios (5).
- **Release 3 – Crecimiento**: búsqueda (6) + SEO (8) + analítica (10) + rendimiento (11) + PWA (12).

Dime con qué release arrancamos (o qué bloques quieres combinar) y armamos el plan de implementación detallado de ese bloque.
