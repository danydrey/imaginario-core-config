import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  description: string;
  sensory_type: string;
  tags: string[];
  votes_count: number;
  views_count: number;
  is_featured: boolean;
  profiles: { username: string };
}

const Index = () => {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select(`
          *,
          profiles:creator_id (username)
        `)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      setExperiences(data || []);

      // Fetch user votes
      if (user) {
        const { data: votesData } = await supabase
          .from("experience_votes")
          .select("experience_id")
          .eq("user_id", user.id);

        if (votesData) {
          setUserVotes(new Set(votesData.map(v => v.experience_id)));
        }
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Experiencias Destacadas</h2>
          <p className="text-muted-foreground">Descubre contenido sensorial único creado por la comunidad</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay experiencias aún. ¡Sé el primero en crear una!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                id={exp.id}
                title={exp.title}
                description={exp.description}
                sensoryType={exp.sensory_type}
                tags={exp.tags}
                votesCount={exp.votes_count}
                viewsCount={exp.views_count}
                isFeatured={exp.is_featured}
                creatorUsername={exp.profiles?.username || "Usuario"}
                userHasVoted={userVotes.has(exp.id)}
                onVoteChange={fetchExperiences}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
