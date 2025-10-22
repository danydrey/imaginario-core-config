import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, TrendingUp, ArrowDownRight, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SendTokensDialog } from "@/components/SendTokensDialog";
import { RedeemDialog } from "@/components/RedeemDialog";

interface TokenData {
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export default function Wallet() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<TokenData>({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setTokens(data);

      const { data: txData } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txData) setTransactions(txData);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-12">
          <p>Cargando billetera...</p>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Billetera
            </span>
            {" "}de Tokens
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus tokens y visualiza tu historial de transacciones
          </p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-hero p-8 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <WalletIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Balance Total</p>
                    <h2 className="text-4xl font-bold text-white">{tokens.balance} Tokens</h2>
                  </div>
                </div>
                <Button variant="glass" size="lg" className="text-white border-white/20">
                  <Coins className="w-5 h-5 mr-2" />
                  Comprar Tokens
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 glass rounded-lg p-4">
                  <p className="text-white/80 text-sm mb-1">Total Ganado</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">+{tokens.total_earned}</span>
                    <span className="text-sm text-white/60 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                <div className="flex-1 glass rounded-lg p-4">
                  <p className="text-white/80 text-sm mb-1">Total Gastado</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">-{tokens.total_spent}</span>
                    <span className="text-sm text-white/60">histórico</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SendTokensDialog userBalance={tokens.balance} onSendSuccess={fetchTokens} />
          <RedeemDialog userBalance={tokens.balance} onRedeemSuccess={fetchTokens} />

          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sensory/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-sensory" />
              </div>
              <div>
                <h3 className="font-semibold">Premium</h3>
                <p className="text-sm text-muted-foreground">Accede a funciones exclusivas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Historial de Transacciones</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tienes transacciones aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {tx.amount > 0 ? (
                      <ArrowDownRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500 rotate-180" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
