import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-imagination/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emotion/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center relative z-10 px-4">
        <h1 className="mb-4 text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent">404</h1>
        <p className="mb-8 text-2xl font-semibold text-foreground">Página no encontrada</p>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          La página que buscas no existe o ha sido movida a otra dimensión sensorial.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button variant="hero" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="glass" size="lg" className="gap-2">
              <Search className="w-5 h-5" />
              Explorar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
