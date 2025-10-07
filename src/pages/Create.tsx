import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { z } from "zod";

const sensoryTypes = [
  { value: "visual", label: "Visual 👁️" },
  { value: "auditivo", label: "Auditivo 👂" },
  { value: "tactil", label: "Táctil ✋" },
  { value: "olfativo", label: "Olfativo 👃" },
  { value: "gustativo", label: "Gustativo 👅" },
  { value: "multisensorial", label: "Multisensorial 🌟" },
];

const experienceSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().trim().min(10, "La descripción debe tener al menos 10 caracteres").max(1000, "La descripción no puede exceder 1000 caracteres"),
  sensory_type: z.string().min(1, "Debes seleccionar un tipo sensorial"),
  tags: z.array(z.string()).max(10, "Máximo 10 etiquetas"),
});

const Create = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sensoryType, setSensoryType] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para crear experiencias");
      navigate("/auth");
      return;
    }

    try {
      const validatedData = experienceSchema.parse({
        title,
        description,
        sensory_type: sensoryType,
        tags,
      });

      setLoading(true);

      const { data, error } = await supabase
        .from("experiences")
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          sensory_type: validatedData.sensory_type,
          tags: validatedData.tags,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("¡Experiencia creada exitosamente! 🎨");
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        console.error("Error creating experience:", error);
        toast.error("Error al crear la experiencia. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Crear Nueva Experiencia</h1>
            <p className="text-muted-foreground">Comparte tu contenido sensorial con la comunidad</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Experiencia</CardTitle>
              <CardDescription>Completa la información para crear tu experiencia sensorial</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Sinfonía de colores al atardecer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                {/* Sensory Type */}
                <div className="space-y-2">
                  <Label htmlFor="sensory-type">Tipo Sensorial *</Label>
                  <Select value={sensoryType} onValueChange={setSensoryType} required>
                    <SelectTrigger id="sensory-type">
                      <SelectValue placeholder="Selecciona un tipo sensorial" />
                    </SelectTrigger>
                    <SelectContent>
                      {sensoryTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu experiencia sensorial en detalle..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/1000 caracteres
                  </p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Etiquetas (Opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Agrega etiquetas..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                      disabled={!currentTag.trim() || tags.length >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {tags.length}/10 etiquetas
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Experiencia"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/")}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Create;
