import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Loader2 } from "lucide-react";

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
  profiles: { username: string };
}

const sensoryTypes = [
  { value: "all", label: "Todos", emoji: "🌟" },
  { value: "visual", label: "Visual", emoji: "👁️" },
  { value: "auditivo", label: "Auditivo", emoji: "👂" },
  { value: "tacto", label: "Tacto", emoji: "✋" },
  { value: "olfato", label: "Olfato", emoji: "👃" },
  { value: "gusto", label: "Gusto", emoji: "👅" },
];

export default function Explore() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("experiences")
        .select(`
          *,
          profiles:creator_id (username)
        `)
        .order("votes_count", { ascending: false });

      if (selectedType !== "all") {
        query = query.eq("sensory_type", selectedType);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

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
  }, [user, selectedType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExperiences();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Explorar Experiencias</h1>
            <p className="text-muted-foreground">Descubre y vota por tus experiencias sensoriales favoritas</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar experiencias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {sensoryTypes.map((type) => (
              <Badge
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  selectedType === type.value ? "bg-gradient-to-r from-primary to-secondary" : ""
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <span className="mr-2">{type.emoji}</span>
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron experiencias</p>
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
                creatorId={exp.creator_id}
                userHasVoted={userVotes.has(exp.id)}
                onVoteChange={fetchExperiences}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
