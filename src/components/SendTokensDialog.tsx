import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SendTokensDialogProps {
  userBalance: number;
  onSendSuccess: () => void;
}

export function SendTokensDialog({ userBalance, onSendSuccess }: SendTokensDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [amount, setAmount] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const tokenAmount = parseInt(amount);
    
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      toast.error("Ingresa una cantidad válida");
      return;
    }

    if (tokenAmount > userBalance) {
      toast.error("No tienes suficientes tokens");
      return;
    }

    try {
      setLoading(true);

      // Find recipient by username
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', recipientUsername)
        .single();

      if (profileError || !recipientProfile) {
        toast.error("Usuario no encontrado");
        return;
      }

      if (recipientProfile.id === user.id) {
        toast.error("No puedes enviarte tokens a ti mismo");
        return;
      }

      // Deduct from sender
      const { error: senderError } = await supabase
        .from('user_tokens')
        .update({
          balance: userBalance - tokenAmount,
          total_spent: userBalance
        })
        .eq('user_id', user.id);

      if (senderError) throw senderError;

      // Get recipient balance
      const { data: recipientTokens } = await supabase
        .from('user_tokens')
        .select('balance, total_earned')
        .eq('user_id', recipientProfile.id)
        .single();

      // Add to recipient
      await supabase
        .from('user_tokens')
        .update({
          balance: (recipientTokens?.balance || 0) + tokenAmount,
          total_earned: (recipientTokens?.total_earned || 0) + tokenAmount
        })
        .eq('user_id', recipientProfile.id);

      // Record transactions
      await supabase
        .from('token_transactions')
        .insert([
          {
            user_id: user.id,
            amount: -tokenAmount,
            transaction_type: 'transfer_sent',
            description: `Enviado a @${recipientUsername}`,
            related_user_id: recipientProfile.id
          },
          {
            user_id: recipientProfile.id,
            amount: tokenAmount,
            transaction_type: 'transfer_received',
            description: `Recibido de @${user.email?.split('@')[0]}`,
            related_user_id: user.id
          }
        ]);

      toast.success(`¡${tokenAmount} tokens enviados a @${recipientUsername}! 🎁`);
      setOpen(false);
      setRecipientUsername("");
      setAmount("");
      onSendSuccess();
    } catch (error) {
      console.error("Error sending tokens:", error);
      toast.error("Error al enviar tokens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-6 hover:shadow-glow transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-imagination/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-imagination" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Enviar Regalo</h3>
              <p className="text-sm text-muted-foreground">
                Comparte tokens con otros usuarios
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Tokens</DialogTitle>
          <DialogDescription>
            Tu balance: <span className="font-bold text-foreground">{userBalance} tokens</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Usuario destinatario</Label>
            <Input
              id="recipient"
              placeholder="username"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Cantidad de tokens</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              min="1"
              max={userBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Tokens"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
