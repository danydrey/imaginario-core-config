import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emotion: string | null;
  sense: string | null;
}

interface Experience {
  id: string;
  title: string;
  description: string;
  sensory_type: string;
  tags: string[];
  votes_count: number;
  views_count: number;
  is_featured: boolean;
  creator_id: string;
  profiles: { username: string } | null;
}

const Coleccion = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data: col } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      setCollection(col);

      if (col) {
        const { data: linked } = await supabase
          .from("collection_experiences")
          .select("experience_id")
          .eq("collection_id", col.id);

        if (linked && linked.length > 0) {
          const ids = linked.map((l) => l.experience_id);
          const { data } = await supabase
            .from("experiences")
            .select("*, profiles:creator_id (username)")
            .in("id", ids);
          setExperiences((data as any) || []);
        } else if (col.sense) {
          const { data } = await supabase
            .from("experiences")
            .select("*, profiles:creator_id (username)")
            .eq("sensory_type", col.sense)
            .order("created_at", { ascending: false })
            .limit(12);
          setExperiences((data as any) || []);
        }
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : !collection ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">Esta colección no existe.</p>
          </Card>
        ) : (
          <>
            <div className="mb-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-[0.25em] text-accent">
                {collection.sense && <span>{collection.sense}</span>}
                {collection.sense && collection.emotion && <span>·</span>}
                {collection.emotion && <span>{collection.emotion}</span>}
              </div>
              <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-3">
                {collection.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed">{collection.description}</p>
            </div>

            {experiences.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-muted-foreground">
                  Aún no hay experiencias en esta colección. Vuelve pronto.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    id={exp.id}
                    title={exp.title}
                    description={exp.description}
                    sensoryType={exp.sensory_type}
                    tags={exp.tags || []}
                    votesCount={exp.votes_count}
                    viewsCount={exp.views_count}
                    isFeatured={exp.is_featured}
                    creatorUsername={exp.profiles?.username || "anónimo"}
                    creatorId={exp.creator_id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Coleccion;