import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ExperienceCardProps {
  id: string;
  title: string;
  description: string;
  sensoryType: string;
  tags: string[];
  votesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  creatorUsername: string;
  userHasVoted?: boolean;
  onVoteChange?: () => void;
}

const sensoryIcons: Record<string, string> = {
  visual: "👁️",
  auditivo: "👂",
  tacto: "✋",
  olfato: "👃",
  gusto: "👅",
};

const sensoryColors: Record<string, string> = {
  visual: "from-purple-500 to-pink-500",
  auditivo: "from-blue-500 to-cyan-500",
  tacto: "from-green-500 to-emerald-500",
  olfato: "from-yellow-500 to-orange-500",
  gusto: "from-red-500 to-rose-500",
};

export const ExperienceCard = ({
  id,
  title,
  description,
  sensoryType,
  tags,
  votesCount,
  viewsCount,
  isFeatured,
  creatorUsername,
  userHasVoted = false,
  onVoteChange
}: ExperienceCardProps) => {
  const { user } = useAuth();
  const [isVoted, setIsVoted] = useState(userHasVoted);
  const [votes, setVotes] = useState(votesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Inicia sesión para votar");
      return;
    }

    setIsLoading(true);
    try {
      if (isVoted) {
        // Remove vote
        const { error } = await supabase
          .from("experience_votes")
          .delete()
          .eq("experience_id", id)
          .eq("user_id", user.id);

        if (error) throw error;
        setIsVoted(false);
        setVotes(prev => prev - 1);
        toast.success("Voto eliminado");
      } else {
        // Add vote
        const { error } = await supabase
          .from("experience_votes")
          .insert({ experience_id: id, user_id: user.id });

        if (error) throw error;
        setIsVoted(true);
        setVotes(prev => prev + 1);
        toast.success("¡Voto registrado!");
      }
      onVoteChange?.();
    } catch (error: any) {
      toast.error("Error al votar");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-scale-in relative overflow-hidden">
      {isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Destacado
          </Badge>
        </div>
      )}
      
      <div className={`h-2 bg-gradient-to-r ${sensoryColors[sensoryType]}`} />
      
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-2xl">{sensoryIcons[sensoryType]}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight">{title}</h3>
              <p className="text-sm text-muted-foreground">por @{creatorUsername}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {viewsCount}
          </div>
        </div>
        
        <Button
          variant={isVoted ? "default" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={isLoading}
          className={isVoted ? "bg-gradient-to-r from-primary to-secondary" : ""}
        >
          <Heart className={`w-4 h-4 mr-1 ${isVoted ? "fill-current" : ""}`} />
          {votes}
        </Button>
      </CardFooter>
    </Card>
  );
};
