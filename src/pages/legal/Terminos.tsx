import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terminos = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Volver</Link>
      </Button>
      <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <h1 className="font-display text-4xl">Términos y Condiciones</h1>
        <p className="text-sm text-muted-foreground">Última actualización: julio de 2026</p>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">1. Aceptación</h2>
          <p>Al usar Imaginar aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">2. Qué es Imaginar</h2>
          <p>Imaginar es un espacio contemplativo para compartir experiencias sensoriales (visuales, auditivas, táctiles, olfativas y gustativas). No es una red social convencional: valoramos la reflexión, la memoria y la conexión humana.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">3. Cuenta y edad mínima</h2>
          <p>Debes tener al menos 13 años. Eres responsable de mantener la seguridad de tu contraseña y de toda la actividad en tu cuenta.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">4. Contenido que compartes</h2>
          <p>Al publicar una experiencia declaras que tienes los derechos sobre el contenido (fotos, audios, videos, texto). Nos otorgas una licencia no exclusiva para mostrarlo dentro de Imaginar. Consulta también nuestra <Link to="/copyright" className="text-primary hover:underline">política de copyright</Link>.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">5. Contenido prohibido</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Contenido ilegal, violento, sexual explícito o que promueva odio.</li>
            <li>Suplantación de identidad o información falsa.</li>
            <li>Spam, publicidad no autorizada o esquemas de recompensa artificiales.</li>
            <li>Material que infrinja derechos de autor de terceros.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">6. Tokens y recompensas</h2>
          <p>Los tokens dentro de Imaginar son puntos internos sin valor monetario real. No son canjeables por dinero. Podemos ajustar el balance en caso de fraude o abuso.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">7. Suspensión</h2>
          <p>Podemos suspender o eliminar cuentas que violen estos términos, sin previo aviso cuando sea necesario para proteger la comunidad.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">8. Limitación de responsabilidad</h2>
          <p>Imaginar se ofrece "tal cual". No garantizamos disponibilidad ininterrumpida ni la exactitud del contenido subido por usuarios.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">9. Cambios</h2>
          <p>Podemos actualizar estos términos. Te notificaremos cambios relevantes dentro de la app.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">10. Contacto</h2>
          <p>Para dudas sobre estos términos, escríbenos desde la sección de ajustes.</p>
        </section>
      </article>
    </div>
  </div>
);

export default Terminos;