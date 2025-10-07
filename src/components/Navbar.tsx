import { Button } from "@/components/ui/button";
import { Brain, User, Settings, Wallet, LogOut, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Imaginar
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/explore" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/explore') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Explorar
            </Link>
            <Link 
              to="/profile" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Perfil
            </Link>
            <Link 
              to="/wallet" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/wallet') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Billetera
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link to="/create">
              <Button variant="hero" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Crear</span>
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="default" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Mi Perfil</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => signOut()}
              title="Cerrar sesión"
              className="hidden md:flex"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
