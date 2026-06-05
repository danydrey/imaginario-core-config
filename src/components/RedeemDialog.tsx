import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, Award, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  reward_type: string;
}

interface RedeemDialogProps {
  userBalance: number;
  onRedeemSuccess: () => void;
}

export function RedeemDialog({ userBalance, onRedeemSuccess }: RedeemDialogProps) {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRewards();
    }
  }, [open]);

  const fetchRewards = async () => {
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('cost', { ascending: true });

    if (data) setRewards(data);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user) return;
    
    if (userBalance < reward.cost) {
      toast.error("No tienes suficientes tokens");
      return;
    }

    try {
      setLoading(true);

      const { error: rpcError } = await supabase.rpc('redeem_reward', {
        p_reward_id: reward.id,
      });
      if (rpcError) throw rpcError;

      toast.success(`¡${reward.name} canjeado exitosamente! ✨`);
      setOpen(false);
      onRedeemSuccess();
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast.error("Error al canjear la recompensa");
    } finally {
      setLoading(false);
    }
  };

  const getRewardIcon = (type: string) => {
    if (type === 'badge') return Award;
    if (type === 'feature_experience') return Star;
    return Sparkles;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="p-6 hover:shadow-glow transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emotion/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6 text-emotion" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Canjear</h3>
              <p className="text-sm text-muted-foreground">
                Intercambia tokens por recompensas exclusivas
              </p>
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Canjear Tokens</DialogTitle>
          <DialogDescription>
            Tu balance: <span className="font-bold text-foreground">{userBalance} tokens</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {rewards.map(reward => {
            const Icon = getRewardIcon(reward.reward_type);
            const canAfford = userBalance >= reward.cost;

            return (
              <Card key={reward.id} className={`p-4 ${!canAfford && 'opacity-50'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{reward.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {reward.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1">
                    <Coins className="w-3 h-3" />
                    {reward.cost}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || loading}
                  >
                    Canjear
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
