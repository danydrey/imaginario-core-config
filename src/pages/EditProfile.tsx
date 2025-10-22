import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().trim().min(3, "El username debe tener al menos 3 caracteres").max(20, "Máximo 20 caracteres"),
  bio: z.string().max(500, "La bio no puede exceder 500 caracteres").optional(),
  instagram_url: z.string().url("URL inválida").optional().or(z.literal("")),
  twitter_url: z.string().url("URL inválida").optional().or(z.literal("")),
  youtube_url: z.string().url("URL inválida").optional().or(z.literal("")),
  tiktok_url: z.string().url("URL inválida").optional().or(z.literal("")),
  website_url: z.string().url("URL inválida").optional().or(z.literal(""))
});

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
        setInstagramUrl(data.instagram_url || "");
        setTwitterUrl(data.twitter_url || "");
        setYoutubeUrl(data.youtube_url || "");
        setTiktokUrl(data.tiktok_url || "");
        setWebsiteUrl(data.website_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande. Máximo 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Solo se permiten imágenes");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(data.publicUrl);
      toast.success("Foto de perfil actualizada");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const validatedData = profileSchema.parse({
        username,
        bio: bio || undefined,
        instagram_url: instagramUrl || undefined,
        twitter_url: twitterUrl || undefined,
        youtube_url: youtubeUrl || undefined,
        tiktok_url: tiktokUrl || undefined,
        website_url: websiteUrl || undefined
      });

      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          username: validatedData.username,
          bio: validatedData.bio,
          avatar_url: avatarUrl,
          instagram_url: validatedData.instagram_url,
          twitter_url: validatedData.twitter_url,
          youtube_url: validatedData.youtube_url,
          tiktok_url: validatedData.tiktok_url,
          website_url: validatedData.website_url
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("¡Perfil actualizado exitosamente! ✨");
      navigate('/profile');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        console.error("Error updating profile:", error);
        toast.error("Error al actualizar el perfil");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <p>Cargando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Perfil
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>
                Personaliza tu perfil y comparte tus redes sociales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} />
                      <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el ícono de cámara para cambiar tu foto
                  </p>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario *</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tunombre"
                    maxLength={20}
                    required
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/500 caracteres
                  </p>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Redes Sociales</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/tu-usuario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://twitter.com/tu-usuario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@tu-canal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      type="url"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@tu-usuario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://tu-sitio.com"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar Cambios"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/profile')}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
