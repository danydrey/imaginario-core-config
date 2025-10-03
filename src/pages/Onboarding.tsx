import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, Ear, Eye, Hand, Heart, Lightbulb } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Eye,
      title: "Vista",
      description: "Experiencias visuales y AR",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Ear,
      title: "Oído",
      description: "Paisajes sonoros inmersivos",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Hand,
      title: "Tacto",
      description: "Interacciones hápticas",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Emoción",
      description: "Contenido que conecta",
      gradient: "from-red-500 to-rose-500"
    },
    {
      icon: Lightbulb,
      title: "Cognición",
      description: "Desafíos y gamificación",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Brain,
      title: "Sinestesia",
      description: "Experiencias multisensoriales",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bienvenido a Imaginar
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explora, crea y comparte experiencias sensoriales únicas. 
            Conecta con una comunidad de creadores y gana tokens por tu participación.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Comenzar Ahora
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => navigate('/auth?mode=signin')}
          >
            Ya tengo cuenta
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Únete a miles de creadores explorando el mundo sensorial
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
