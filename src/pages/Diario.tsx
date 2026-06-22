import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface DiaryEntry {
  id: string;
  title: string;
  description: string;
  sensory_type: string;
  created_at: string;
  votes_count: number;
  tags: string[];
}

const sensoryLabel: Record<string, string> = {
  visual: "Visual",
  auditivo: "Auditivo",
  tacto: "Tacto",
  olfato: "Olfato",
  gusto: "Gusto",
};

const Diario = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("experiences")
        .select("id, title, description, sensory_type, created_at, votes_count, tags")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("No se pudo cargar tu diario");
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const totals = entries.reduce(
    (acc, e) => {
      acc.sentidos[e.sensory_type] = (acc.sentidos[e.sensory_type] || 0) + 1;
      acc.resonancias += e.votes_count || 0;
      return acc;
    },
    { sentidos: {} as Record<string, number>, resonancias: 0 }
  );

  const topSentido = Object.entries(totals.sentidos).sort((a, b) => b[1] - a[1])[0]?.[0];

  const askCurator = async () => {
    if (entries.length === 0) {
      toast.info("Aún no hay experiencias para interpretar");
      return;
    }
    setAiLoading(true);
    setAiInsight(null);
    try {
      const corpus = entries
        .slice(0, 10)
        .map((e) => `[${e.sensory_type}] ${e.title}: ${e.description}`)
        .join("\n");
      const { data, error } = await supabase.functions.invoke("curate-experience", {
        body: {
          title: "Diario sensorial de un explorador",
          description: corpus,
          sensoryType: topSentido || "",
        },
      });
      if (error) throw error;
      const text =
        data?.invitacion ||
        (typeof data === "string" ? data : JSON.stringify(data, null, 2));
      setAiInsight(text);
    } catch (e: any) {
      toast.error(e?.message || "El curador no pudo responder");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">Diario sensorial</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">
            Tu <span className="italic text-accent">memoria</span> sensorial
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Un recorrido íntimo por las experiencias que has compartido. Cada entrada es un
            momento que decidiste guardar.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <Card className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Momentos</p>
                <p className="font-display text-3xl mt-2">{entries.length}</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Resonancias</p>
                <p className="font-display text-3xl mt-2">{totals.resonancias}</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sentido principal</p>
                <p className="font-display text-2xl mt-2 italic text-accent">
                  {topSentido ? sensoryLabel[topSentido] : "—"}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sentidos explorados</p>
                <p className="font-display text-3xl mt-2">{Object.keys(totals.sentidos).length} / 5</p>
              </Card>
            </div>

            <Card className="p-6 mb-10 bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl mb-1">Curador sensorial</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Una lectura poética de tu paisaje sensorial, generada con IA.
                  </p>
                  {aiInsight && (
                    <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap italic">
                      {aiInsight}
                    </p>
                  )}
                  <Button onClick={askCurator} disabled={aiLoading} size="sm" variant="outline">
                    {aiLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Interpretando…</>
                    ) : (
                      <>Pedir interpretación</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" /> Línea de tiempo
            </h2>
            {entries.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-muted-foreground mb-4">
                  Tu diario está en blanco. La primera página te espera.
                </p>
                <Link to="/create">
                  <Button>Crear mi primera experiencia</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4 border-l-2 border-accent/20 pl-6 ml-2">
                {entries.map((e) => (
                  <Card key={e.id} className="p-5 relative">
                    <div className="absolute -left-[33px] top-6 w-3 h-3 rounded-full bg-accent" />
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span className="uppercase tracking-wider">
                        {sensoryLabel[e.sensory_type] || e.sensory_type}
                      </span>
                      <span>·</span>
                      <span>{new Date(e.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                    <h3 className="font-display text-xl mb-1">{e.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{e.description}</p>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Diario;