import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type TargetType = "experience" | "profile" | "comment";

interface ReportDialogProps {
  targetId: string;
  targetType: TargetType;
  trigger?: React.ReactNode;
}

const REASONS = [
  { value: "spam", label: "Spam o contenido repetitivo" },
  { value: "inappropriate", label: "Contenido inapropiado u ofensivo" },
  { value: "copyright", label: "Infringe derechos de autor" },
  { value: "harassment", label: "Acoso o discurso de odio" },
  { value: "misinformation", label: "Información falsa o engañosa" },
  { value: "other", label: "Otro motivo" },
];

export const ReportDialog = ({ targetId, targetType, trigger }: ReportDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Inicia sesión para reportar");
      return;
    }
    if (!reason) {
      toast.error("Selecciona un motivo");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_id: targetId,
        target_type: targetType,
        reason,
        description: description.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya reportaste este contenido");
        } else {
          throw error;
        }
      } else {
        toast.success("Reporte enviado. Gracias por cuidar la comunidad.");
        setOpen(false);
        setReason("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
      toast.error("No se pudo enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Reportar contenido</DialogTitle>
          <DialogDescription>
            Ayúdanos a mantener Imaginar como un espacio seguro. Nuestro equipo revisará tu reporte.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Detalles (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Cuéntanos más sobre el problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !reason}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando</> : "Enviar reporte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};