import { Button } from "@/components/ui/button";
import { Leaf, Waves, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-sensory.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden paper-grain">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Paisaje sensorial contemplativo"
          className="w-full h-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 left-10 w-56 h-56 bg-sensory/15 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-24 right-10 w-64 h-64 bg-imagination/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-emotion/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 glass rounded-full">
            <Leaf className="w-4 h-4 text-sensory" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">La red social de las experiencias humanas</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-foreground">
            No compartimos publicaciones.
            <br />
            <span className="italic text-accent">Compartimos momentos.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Un espacio contemplativo para explorar el mundo a través de los sentidos, las emociones y la memoria. La pregunta no es qué estás haciendo,
            <span className="text-foreground"> sino qué estás experimentando.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/create">
              <Button variant="hero" size="xl" className="group">
                Crear una experiencia
                <Leaf className="w-5 h-5 group-hover:rotate-6 transition-transform" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="glass" size="xl">
                Explorar el atlas sensorial
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-10">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Sun className="w-4 h-4 text-emotion" />
              <span className="text-sm">Percepción</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Waves className="w-4 h-4 text-imagination" />
              <span className="text-sm">Memoria</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Leaf className="w-4 h-4 text-sensory" />
              <span className="text-sm">Resonancia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
