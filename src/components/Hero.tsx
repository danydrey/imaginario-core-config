import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-sensory.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Sensory experience visualization" 
          className="w-full h-full object-cover opacity-60 dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-imagination/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emotion/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-sensory/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-imagination" />
            <span className="text-sm font-medium">Experiencias Sensoriales y Cognitivas</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Imagina
            </span>
            {" "}tu Mundo Interior
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explora, comparte y conecta a través de experiencias sensoriales únicas. 
            Una plataforma donde la imaginación y la emoción cobran vida.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/create">
              <Button variant="hero" size="xl" className="group">
                Comenzar Ahora
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="glass" size="xl">
                Explorar Experiencias
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center pt-8">
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Brain className="w-4 h-4 text-imagination" />
              <span className="text-sm">Cognitivo</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Heart className="w-4 h-4 text-emotion" />
              <span className="text-sm">Emocional</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
              <Sparkles className="w-4 h-4 text-sensory" />
              <span className="text-sm">Sensorial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
