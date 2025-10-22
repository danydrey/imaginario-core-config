import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Calendar, Award, Sparkles, Instagram, Twitter, Youtube, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FriendshipManager } from "@/components/FriendshipManager";
import { SensoryMapChart } from "@/components/SensoryMapChart";

interface Profile {
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

interface Experience {
  id: string;
  title: string;
  sensory_type: string;
  created_at: string;
  votes_count: number;
}

interface TokenData {
  balance: number;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tokens, setTokens] = useState<TokenData>({ balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Fetch experiences
        const { data: expData } = await supabase
          .from('experiences')
          .select('id, title, sensory_type, created_at, votes_count')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (expData) setExperiences(expData);

        // Fetch tokens
        const { data: tokenData } = await supabase
          .from('user_tokens')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (tokenData) setTokens(tokenData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <p>Cargando perfil...</p>
        </main>
      </div>
    );
  }
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
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} />
                <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                  {profile?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-3 pt-16 md:pt-0">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile?.username || 'Usuario'}</h1>
                  <p className="text-muted-foreground">@{profile?.username || 'usuario'}</p>
                </div>

                <p className="text-sm max-w-2xl">
                  {profile?.bio || 'Explorando las dimensiones sensoriales y cognitivas de la experiencia humana.'}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro desde {new Date(profile?.created_at || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <FriendshipManager />
                <Button variant="outline" className="gap-2" onClick={() => navigate('/profile/edit')}>
                  <Settings className="w-4 h-4" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1">
              {experiences.length}
            </div>
            <div className="text-sm text-muted-foreground">Experiencias</div>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold text-emotion mb-1">
              {experiences.reduce((acc, exp) => acc + exp.votes_count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Me Gusta Totales</div>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/wallet')}>
            <div className="text-3xl font-bold text-sensory mb-1">{tokens.balance}</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-glow transition-all cursor-pointer">
            <div className="text-3xl font-bold text-imagination mb-1">
              {experiences.filter(e => new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-muted-foreground">Esta Semana</div>
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
            {experiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experiences.map((exp) => (
                  <Card key={exp.id} className="overflow-hidden group cursor-pointer hover:shadow-glow transition-all">
                    <div className={`h-40 bg-gradient-to-br ${
                      exp.sensory_type === 'visual' ? 'from-purple-500 to-pink-500' :
                      exp.sensory_type === 'auditivo' ? 'from-blue-500 to-cyan-500' :
                      exp.sensory_type === 'tacto' ? 'from-green-500 to-emerald-500' :
                      exp.sensory_type === 'olfato' ? 'from-yellow-500 to-orange-500' :
                      'from-red-500 to-pink-500'
                    } relative`}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                      <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                        ❤️ {exp.votes_count}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exp.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Aún no has creado experiencias</p>
                <Button variant="hero" className="mt-4" onClick={() => navigate('/create')}>
                  Crear Primera Experiencia
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <SensoryMapChart />
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
