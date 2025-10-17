import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Lock, 
  Eye, 
  HelpCircle, 
  FileText, 
  MessageSquare,
  UserX,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Settings() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState({
    pushNotifs: true,
    emailNotifs: false,
    commentNotifs: true,
    profilePublic: true,
    showMap: true,
    analytics: true,
    darkMode: false,
    animations: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Ajustes
            </span>
          </h1>
          <p className="text-muted-foreground">
            Personaliza tu experiencia en Imaginar
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Notificaciones</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifs" className="text-base">Notificaciones Push</Label>
                  <p className="text-sm text-muted-foreground">Recibe alertas en tiempo real</p>
                </div>
                <Switch 
                  id="push-notifs" 
                  checked={settings.pushNotifs}
                  onCheckedChange={() => handleToggle('pushNotifs')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifs" className="text-base">Notificaciones por Email</Label>
                  <p className="text-sm text-muted-foreground">Resumen semanal de actividad</p>
                </div>
                <Switch 
                  id="email-notifs" 
                  checked={settings.emailNotifs}
                  onCheckedChange={() => handleToggle('emailNotifs')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="comment-notifs" className="text-base">Comentarios</Label>
                  <p className="text-sm text-muted-foreground">Cuando alguien comenta tus experiencias</p>
                </div>
                <Switch 
                  id="comment-notifs" 
                  checked={settings.commentNotifs}
                  onCheckedChange={() => handleToggle('commentNotifs')}
                />
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Privacidad</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="profile-public" className="text-base">Perfil Público</Label>
                  <p className="text-sm text-muted-foreground">Permite que otros vean tu perfil</p>
                </div>
                <Switch 
                  id="profile-public" 
                  checked={settings.profilePublic}
                  onCheckedChange={() => handleToggle('profilePublic')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-map" className="text-base">Mostrar Mapa Sensorial</Label>
                  <p className="text-sm text-muted-foreground">Visible para otros usuarios</p>
                </div>
                <Switch 
                  id="show-map" 
                  checked={settings.showMap}
                  onCheckedChange={() => handleToggle('showMap')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="analytics" className="text-base">Análisis de Datos</Label>
                  <p className="text-sm text-muted-foreground">Ayúdanos a mejorar la experiencia</p>
                </div>
                <Switch 
                  id="analytics" 
                  checked={settings.analytics}
                  onCheckedChange={() => handleToggle('analytics')}
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Apariencia</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-base">Modo Oscuro</Label>
                  <p className="text-sm text-muted-foreground">Tema oscuro para la aplicación</p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={settings.darkMode}
                  onCheckedChange={() => handleToggle('darkMode')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations" className="text-base">Animaciones</Label>
                  <p className="text-sm text-muted-foreground">Efectos visuales y transiciones</p>
                </div>
                <Switch 
                  id="animations" 
                  checked={settings.animations}
                  onCheckedChange={() => handleToggle('animations')}
                />
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="p-6">
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3">
                <UserX className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Usuarios Bloqueados</div>
                  <div className="text-sm text-muted-foreground">Gestionar lista de bloqueados</div>
                </div>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3">
                <HelpCircle className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Ayuda y Soporte</div>
                  <div className="text-sm text-muted-foreground">Preguntas frecuentes y contacto</div>
                </div>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3">
                <MessageSquare className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Enviar Feedback</div>
                  <div className="text-sm text-muted-foreground">Ayúdanos a mejorar</div>
                </div>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3">
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Términos y Privacidad</div>
                  <div className="text-sm text-muted-foreground">Lee nuestras políticas</div>
                </div>
              </Button>

              <Separator />
              
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-3 mt-4"
                onClick={signOut}
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
