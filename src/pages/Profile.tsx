import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MapPin, Calendar, Award, Sparkles } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-hero relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-4 border-background shadow-glow">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=imaginar" />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">IM</AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-3 pt-16 md:pt-0">
                <div>
                  <h1 className="text-3xl font-bold mb-1">Usuario Imaginar</h1>
                  <p className="text-muted-foreground">@imaginar_user</p>
                </div>

                <p className="text-sm max-w-2xl">
                  Explorando las dimensiones sensoriales y cognitivas de la experiencia humana. 
                  Compartiendo momentos que trascienden lo ordinario.
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Madrid, España</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro desde Enero 2025</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Editar Perfil
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
              42
            </div>
            <div className="text-sm text-muted-foreground">Experiencias</div>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold text-emotion mb-1">1.2K</div>
            <div className="text-sm text-muted-foreground">Seguidores</div>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold text-imagination mb-1">890</div>
            <div className="text-sm text-muted-foreground">Me Gusta</div>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold text-sensory mb-1">350</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="experiences" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="experiences">Experiencias</TabsTrigger>
            <TabsTrigger value="map">Mapa Sensorial</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
          </TabsList>

          <TabsContent value="experiences" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden group cursor-pointer hover:shadow-glow transition-all">
                  <div className="h-40 bg-gradient-to-br from-imagination to-emotion relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">Experiencia #{i}</h3>
                    <p className="text-sm text-muted-foreground">Hace 2 días</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Mapa Sensorial</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Visualiza tu recorrido a través de experiencias sensoriales y cognitivas
                </p>
                <Button variant="hero" className="mt-4">
                  Explorar Mapa
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Explorador Sensorial", icon: Sparkles, color: "sensory" },
                { name: "Maestro Cognitivo", icon: Award, color: "imagination" },
                { name: "Conector Emocional", icon: Award, color: "emotion" },
              ].map((achievement, i) => (
                <Card key={i} className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${achievement.color}/20 flex items-center justify-center`}>
                    <achievement.icon className={`w-8 h-8 text-${achievement.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{achievement.name}</h3>
                  <Badge variant="secondary" className="mt-2">Desbloqueado</Badge>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
