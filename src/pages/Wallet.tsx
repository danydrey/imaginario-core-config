import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, TrendingUp, Gift, ArrowUpRight, ArrowDownRight, Coins } from "lucide-react";

const transactions = [
  { id: 1, type: "earned", amount: 50, description: "Experiencia destacada", date: "Hace 2 horas" },
  { id: 2, type: "spent", amount: 20, description: "Regalo virtual", date: "Hace 1 día" },
  { id: 3, type: "earned", amount: 100, description: "Logro desbloqueado", date: "Hace 2 días" },
  { id: 4, type: "earned", amount: 30, description: "Interacción comunitaria", date: "Hace 3 días" },
];

export default function Wallet() {
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
                    <h2 className="text-4xl font-bold text-white">350 Tokens</h2>
                  </div>
                </div>
                <Button variant="glass" size="lg" className="text-white border-white/20">
                  <Coins className="w-5 h-5 mr-2" />
                  Comprar Tokens
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 glass rounded-lg p-4">
                  <p className="text-white/80 text-sm mb-1">Ganados este mes</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">+180</span>
                    <span className="text-sm text-white/60 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      12%
                    </span>
                  </div>
                </div>
                <div className="flex-1 glass rounded-lg p-4">
                  <p className="text-white/80 text-sm mb-1">Gastados este mes</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">-80</span>
                    <span className="text-sm text-white/60">vs mes anterior</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-imagination/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-6 h-6 text-imagination" />
              </div>
              <div>
                <h3 className="font-semibold">Enviar Regalo</h3>
                <p className="text-sm text-muted-foreground">A otros usuarios</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emotion/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-emotion" />
              </div>
              <div>
                <h3 className="font-semibold">Canjear</h3>
                <p className="text-sm text-muted-foreground">Por beneficios</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sensory/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-sensory" />
              </div>
              <div>
                <h3 className="font-semibold">Premium</h3>
                <p className="text-sm text-muted-foreground">Suscripciones</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Historial de Transacciones</h2>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'earned' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {tx.type === 'earned' ? (
                      <ArrowDownRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${
                  tx.type === 'earned' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
