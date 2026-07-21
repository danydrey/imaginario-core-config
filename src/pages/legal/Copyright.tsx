import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Copyright = () => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Volver</Link>
      </Button>
      <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <h1 className="font-display text-4xl">Política de Copyright</h1>
        <p className="text-sm text-muted-foreground">Última actualización: julio de 2026</p>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Respeto por los derechos de autor</h2>
          <p>Imaginar respeta los derechos de autor. Solo puedes subir contenido (fotografías, audios, música, videos, textos) que hayas creado tú o para el cual tengas permiso explícito del autor.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Especialmente con audio y música</h2>
          <p>La música y los fragmentos sonoros están protegidos por derechos de autor incluso cuando son breves. Antes de subir un audio verifica que:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Lo grabaste tú mismo (sonidos ambientales, tu voz, tu instrumento).</li>
            <li>Tiene licencia libre (Creative Commons, dominio público) y respetas sus condiciones de atribución.</li>
            <li>Cuentas con autorización escrita del artista o sello discográfico.</li>
          </ul>
          <p className="italic text-muted-foreground">Un fragmento de una canción comercial —aunque dure segundos— puede infringir derechos.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Cómo reportar una infracción</h2>
          <p>Si crees que un contenido en Imaginar infringe tu derecho de autor, usa el botón <strong>Reportar</strong> disponible en cada experiencia y selecciona "Infringe derechos de autor". Incluye en la descripción:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Descripción de la obra original.</li>
            <li>URL de la experiencia infractora.</li>
            <li>Prueba de titularidad (link a la obra original, registro, etc.).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Qué hacemos ante un reporte válido</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Retiramos el contenido reportado mientras revisamos.</li>
            <li>Notificamos al usuario que subió el material.</li>
            <li>Los reincidentes pierden su cuenta.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl">Contra-notificación</h2>
          <p>Si crees que tu contenido fue retirado por error, puedes escribirnos desde ajustes con la evidencia correspondiente.</p>
        </section>
      </article>
    </div>
  </div>
);

export default Copyright;