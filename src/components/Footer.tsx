import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/40 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="font-display italic">Imaginar — un ecosistema sensorial</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <Link to="/terminos" className="hover:text-foreground transition-colors">Términos</Link>
          <Link to="/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
          <Link to="/copyright" className="hover:text-foreground transition-colors">Copyright</Link>
        </nav>
      </div>
    </footer>
  );
};