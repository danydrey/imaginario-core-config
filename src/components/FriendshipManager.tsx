import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users, Check, X, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_profile?: {
    username: string;
    avatar_url: string;
  };
}

export function FriendshipManager() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);

  useEffect(() => {
    if (open && user) {
      fetchFriendships();
    }
  }, [open, user]);

  const fetchFriendships = async () => {
    if (!user) return;

    // Get accepted friendships
    const { data: accepted } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!friendships_friend_id_fkey(username, avatar_url)
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (accepted) setFriendships(accepted as any);

    // Get pending requests (received)
    const { data: pending } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!friendships_user_id_fkey(username, avatar_url)
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (pending) setPendingRequests(pending as any);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !searchUsername.trim()) return;

    try {
      setLoading(true);

      // Find user by username
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', searchUsername.trim())
        .single();

      if (profileError || !recipientProfile) {
        toast.error("Usuario no encontrado");
        return;
      }

      if (recipientProfile.id === user.id) {
        toast.error("No puedes enviarte una solicitud a ti mismo");
        return;
      }

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${recipientProfile.id}),and(user_id.eq.${recipientProfile.id},friend_id.eq.${user.id})`)
        .single();

      if (existing) {
        toast.error("Ya existe una solicitud con este usuario");
        return;
      }

      // Create friendship request
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: recipientProfile.id,
          status: 'pending'
        });

      if (error) throw error;

      toast.success(`Solicitud enviada a @${recipientProfile.username}`);
      setSearchUsername("");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success("Solicitud aceptada");
      fetchFriendships();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Error al aceptar solicitud");
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success("Solicitud rechazada");
      fetchFriendships();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Error al rechazar solicitud");
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success("Amigo eliminado");
      fetchFriendships();
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Error al eliminar amigo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Conectar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Amistades</DialogTitle>
          <DialogDescription>
            Conecta con otros usuarios y construye tu red sensorial
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="add" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add">Agregar</TabsTrigger>
            <TabsTrigger value="requests">
              Solicitudes {pendingRequests.length > 0 && <Badge className="ml-2">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="friends">
              Amigos {friendships.length > 0 && <Badge variant="secondary" className="ml-2">{friendships.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            <p className="text-sm text-muted-foreground italic">
              Escribe el nombre de usuario exacto (sin @) de la persona con quien quieres conectar.
            </p>
            <form onSubmit={handleSendRequest} className="flex gap-2">
              <Input
                placeholder="nombredeusuario"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
              />
              <Button type="submit" disabled={loading || !searchUsername.trim()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Enviar solicitud
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="requests" className="space-y-3">
            {pendingRequests.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No tienes solicitudes pendientes
              </Card>
            ) : (
              pendingRequests.map(request => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.friend_profile?.avatar_url} />
                        <AvatarFallback>
                          {request.friend_profile?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">@{request.friend_profile?.username}</p>
                        <p className="text-xs text-muted-foreground">Solicitud de amistad</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="friends" className="space-y-3">
            {friendships.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Aún no tienes amigos conectados
              </Card>
            ) : (
              friendships.map(friendship => (
                <Card key={friendship.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friendship.friend_profile?.avatar_url} />
                        <AvatarFallback>
                          {friendship.friend_profile?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">@{friendship.friend_profile?.username}</p>
                        <p className="text-xs text-muted-foreground">Amigo</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFriend(friendship.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
