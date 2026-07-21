import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles as Resonance, Eye, Leaf, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ReportDialog } from "./ReportDialog";

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
  creatorId: string;
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
  visual: "from-imagination to-secondary",
  auditivo: "from-secondary to-imagination",
  tacto: "from-sensory to-primary",
  olfato: "from-sand to-accent",
  gusto: "from-accent to-emotion",
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
  creatorId,
  userHasVoted = false,
  onVoteChange
}: ExperienceCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVoted, setIsVoted] = useState(userHasVoted);
  const [votes, setVotes] = useState(votesCount);
  const [isLoading, setIsLoading] = useState(false);
  
  const isOwner = user?.id === creatorId;

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
        toast.success("Resonancia retirada");
      } else {
        // Add vote
        const { error } = await supabase
          .from("experience_votes")
          .insert({ experience_id: id, user_id: user.id });

        if (error) throw error;
        setIsVoted(true);
        setVotes(prev => prev + 1);
        toast.success("✨ Resonó contigo");
      }
      onVoteChange?.();
    } catch (error: any) {
      toast.error("No se pudo resonar");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de eliminar esta experiencia?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Experiencia eliminada");
      onVoteChange?.();
    } catch (error: any) {
      toast.error("Error al eliminar");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-soft transition-smooth hover:-translate-y-1 animate-scale-in relative overflow-hidden border-border/40 bg-card/60 backdrop-blur-sm">
      {isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-accent to-emotion text-accent-foreground border-0">
            <Leaf className="w-3 h-3 mr-1" />
            Memorable
          </Badge>
        </div>
      )}
      
      <div className={`h-1 bg-gradient-to-r ${sensoryColors[sensoryType]}`} />
      
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-2xl">{sensoryIcons[sensoryType]}</span>
            <div className="flex-1">
              <h3 className="font-display text-xl leading-tight tracking-tight">{title}</h3>
              <p className="text-xs text-muted-foreground italic">compartido por @{creatorUsername}</p>
            </div>
          </div>
          <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed">{description}</p>
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
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/create?edit=${id}`);
                }}
                disabled={isLoading}
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              {viewsCount}
            </div>
          )}
          {!isOwner && user && (
            <ReportDialog targetId={id} targetType="experience" />
          )}
        </div>
        
        <Button
          variant={isVoted ? "default" : "outline"}
          size="sm"
          onClick={handleVote}
          disabled={isLoading}
          className={isVoted ? "bg-gradient-to-r from-accent to-emotion border-0" : ""}
          title={isVoted ? "Quitar resonancia" : "Resonó conmigo"}
        >
          <Resonance className={`w-4 h-4 mr-1 ${isVoted ? "fill-current" : ""}`} />
          {votes}
        </Button>
      </CardFooter>
    </Card>
  );
};
