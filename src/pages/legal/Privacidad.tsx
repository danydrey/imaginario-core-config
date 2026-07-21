import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacidad = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Volver</Link>
      </Button>
      <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <h1 className="font-display text-4xl">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: julio de 2026</p>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Qué recopilamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Cuenta:</strong> email, nombre de usuario y contraseña cifrada.</li>
            <li><strong>Perfil:</strong> foto, biografía y enlaces sociales que decidas añadir.</li>
            <li><strong>Contenido:</strong> experiencias, fotos, audios y videos que publiques.</li>
            <li><strong>Interacciones:</strong> resonancias, seguimientos, transferencias de tokens.</li>
            <li><strong>Técnicos:</strong> logs mínimos de acceso para seguridad.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Para qué lo usamos</h2>
          <p>Para operar la plataforma, proteger la comunidad, mostrar tu contenido a otros usuarios y enviarte correos esenciales (recuperación de contraseña, verificación).</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Quién puede ver tu contenido</h2>
          <p>Las experiencias que publicas son visibles para toda la comunidad. Tu email nunca se muestra públicamente. Los mensajes de amistad solo son visibles para las partes involucradas.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Tus derechos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Editar o eliminar tu perfil y experiencias en cualquier momento.</li>
            <li>Solicitar la eliminación completa de tu cuenta.</li>
            <li>Exportar tus datos (contáctanos).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Cookies</h2>
          <p>Usamos únicamente cookies técnicas necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad ni rastreo de terceros.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Terceros</h2>
          <p>La infraestructura corre sobre Lovable Cloud (Supabase) para almacenamiento y autenticación. No vendemos ni cedemos tus datos a terceros con fines comerciales.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Menores</h2>
          <p>Imaginar no está dirigido a menores de 13 años. Si detectamos una cuenta de menor edad, la eliminaremos.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Contacto</h2>
          <p>Para preguntas sobre privacidad o solicitudes de eliminación, escríbenos desde la sección de ajustes.</p>
        </section>
      </article>
    </div>
  </div>
);

export default Privacidad;