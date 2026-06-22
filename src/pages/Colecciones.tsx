import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Library } from "lucide-react";

interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emotion: string | null;
  sense: string | null;
  cover_url: string | null;
}

const senseGradient: Record<string, string> = {
  visual: "from-imagination/30 to-secondary/30",
  auditivo: "from-secondary/30 to-imagination/30",
  tacto: "from-sensory/30 to-primary/30",
  olfato: "from-sand/30 to-accent/30",
  gusto: "from-accent/30 to-emotion/30",
};

const Colecciones = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setCollections(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Colecciones temáticas</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">
            Caminos <span className="italic text-accent">curados</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Recorridos sensoriales agrupados por emoción, sentido o territorio. Una invitación a
            perderse entre los recuerdos compartidos.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link key={c.id} to={`/colecciones/${c.slug}`}>
                <Card className="overflow-hidden h-full transition-smooth hover:shadow-glow cursor-pointer group">
                  <div
                    className={`h-40 bg-gradient-to-br ${
                      senseGradient[c.sense || ""] || "from-accent/20 to-secondary/20"
                    } flex items-center justify-center`}
                  >
                    <Library className="w-12 h-12 text-foreground/30 group-hover:scale-110 transition-smooth" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {c.sense && <span>{c.sense}</span>}
                      {c.sense && c.emotion && <span>·</span>}
                      {c.emotion && <span className="text-accent">{c.emotion}</span>}
                    </div>
                    <h3 className="font-display text-2xl mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{c.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Colecciones;