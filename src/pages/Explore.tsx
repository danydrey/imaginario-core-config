import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Sparkles, Brain, Eye } from "lucide-react";

const experiences = [
  {
    id: 1,
    title: "Amanecer en las Montañas",
    author: "María González",
    category: "Sensorial",
    type: "Visual",
    likes: 234,
    comments: 45,
    gradient: "from-orange-400 to-pink-500",
  },
  {
    id: 2,
    title: "Melodía del Océano",
    author: "Carlos Ruiz",
    category: "Cognitivo",
    type: "Auditivo",
    likes: 189,
    comments: 32,
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    id: 3,
    title: "Recuerdo de Infancia",
    author: "Ana Martínez",
    category: "Emocional",
    type: "Memoria",
    likes: 456,
    comments: 78,
    gradient: "from-purple-400 to-pink-500",
  },
  {
    id: 4,
    title: "Jardín de Aromas",
    author: "Luis Fernández",
    category: "Sensorial",
    type: "Olfativo",
    likes: 312,
    comments: 54,
    gradient: "from-green-400 to-emerald-500",
  },
];

export default function Explore() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Explorar
            </span>
            {" "}Experiencias
          </h1>
          <p className="text-muted-foreground">
            Descubre mundos sensoriales y cognitivos compartidos por la comunidad
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button variant="default" size="sm">Todos</Button>
          <Button variant="ghost" size="sm">Sensorial</Button>
          <Button variant="ghost" size="sm">Cognitivo</Button>
          <Button variant="ghost" size="sm">Emocional</Button>
        </div>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <Card key={exp.id} className="overflow-hidden group cursor-pointer hover:shadow-glow transition-all">
              {/* Image Placeholder with Gradient */}
              <div className={`h-48 bg-gradient-to-br ${exp.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 backdrop-blur-sm border-white/40">
                    {exp.type}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  {exp.category === "Sensorial" && <Sparkles className="w-6 h-6 text-white" />}
                  {exp.category === "Cognitivo" && <Brain className="w-6 h-6 text-white" />}
                  {exp.category === "Emocional" && <Heart className="w-6 h-6 text-white fill-white" />}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">por {exp.author}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-emotion transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{exp.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{exp.comments}</span>
                    </button>
                  </div>
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
