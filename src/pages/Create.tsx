import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Loader2, X, Plus, ArrowLeft, ArrowRight, Leaf, Check } from "lucide-react";
import { z } from "zod";
import { FileUpload } from "@/components/FileUpload";

const sensoryTypes = [
  { value: "visual", label: "Visual", icon: "👁️", hint: "lo que viste" },
  { value: "auditivo", label: "Auditivo", icon: "👂", hint: "lo que escuchaste" },
  { value: "tacto", label: "Tacto", icon: "✋", hint: "lo que sentiste al tocar" },
  { value: "olfato", label: "Olfato", icon: "👃", hint: "el aroma que recuerdas" },
  { value: "gusto", label: "Gusto", icon: "👅", hint: "el sabor que te marcó" },
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sensoryType, setSensoryType] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Load experience data if editing
  useEffect(() => {
    if (editId && user) {
      loadExperience();
    }
  }, [editId, user]);

  const loadExperience = async () => {
    try {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", editId)
        .eq("creator_id", user!.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setSensoryType(data.sensory_type);
        setTags(data.tags || []);
        setMediaUrl(data.media_url || "");
        setMediaType(data.media_type || "");
      }
    } catch (error: any) {
      toast.error("Error al cargar la experiencia");
      navigate("/");
    }
  };

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

      if (editId) {
        // Update existing experience
        const { error } = await supabase
          .from("experiences")
          .update({
            title: validatedData.title,
            description: validatedData.description,
            sensory_type: validatedData.sensory_type,
            tags: validatedData.tags,
            media_url: mediaUrl,
            media_type: mediaType,
          })
          .eq("id", editId)
          .eq("creator_id", user.id);

        if (error) throw error;
        toast.success("¡Experiencia actualizada! ✨");
      } else {
        // Create new experience
        const { data, error } = await supabase
          .from("experiences")
          .insert({
            title: validatedData.title,
            description: validatedData.description,
            sensory_type: validatedData.sensory_type,
            tags: validatedData.tags,
            media_url: mediaUrl,
            media_type: mediaType,
            creator_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        toast.success("¡Experiencia creada exitosamente! 🎨");
      }
      
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        console.error("Error saving experience:", error);
        toast.error("Error al guardar la experiencia. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return sensoryType !== "" && title.trim().length >= 3;
    if (step === 2) return description.trim().length >= 10;
    return true;
  };

  const stepLabels = ["Sentido", "Esencia", "Memoria", "Resonancia"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3">
              {editId ? "Reescribir un momento" : "Compartir un momento"}
            </p>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">
              {editId ? "Editar experiencia" : (
                <>Una <span className="italic text-accent">experiencia</span> nace</>
              )}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Tómate tu tiempo. No estás publicando — estás dejando huella de algo que sentiste.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            {stepLabels.map((label, i) => {
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`h-1 w-full rounded-full transition-smooth ${
                    done ? "bg-accent" : active ? "bg-accent/60" : "bg-muted"
                  }`} />
                  <span className={`text-[10px] uppercase tracking-wider ${
                    active ? "text-accent font-medium" : done ? "text-foreground/60" : "text-muted-foreground"
                  }`}>
                    {done && <Check className="inline w-3 h-3 mr-0.5" />}{label}
                  </span>
                </div>
              );
            })}
          </div>

          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                {/* Step 1: Sentido + Título */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-3">
                      <Label>¿Por cuál sentido entró esta experiencia?</Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {sensoryTypes.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setSensoryType(t.value)}
                            className={`p-4 rounded-lg border transition-smooth text-center ${
                              sensoryType === t.value
                                ? "border-accent bg-accent/10 shadow-soft"
                                : "border-border/60 hover:border-accent/50 hover:bg-accent/5"
                            }`}
                          >
                            <div className="text-3xl mb-1">{t.icon}</div>
                            <div className="text-xs font-medium">{t.label}</div>
                          </button>
                        ))}
                      </div>
                      {sensoryType && (
                        <p className="text-xs text-muted-foreground italic">
                          Vas a compartir {sensoryTypes.find(t => t.value === sensoryType)?.hint}.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Dale un nombre a este momento</Label>
                      <Input
                        id="title"
                        placeholder="Ej: La luz dorada de las cinco de la tarde"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                      />
                      <p className="text-xs text-muted-foreground">{title.length}/100</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Descripción */}
                {step === 2 && (
                  <div className="space-y-3 animate-fade-in">
                    <Label htmlFor="description">Cuéntalo con tus palabras</Label>
                    <p className="text-sm text-muted-foreground italic">
                      ¿Dónde estabas? ¿Qué sentiste en el cuerpo? ¿Qué te recordó? No tiene que ser perfecto, solo honesto.
                    </p>
                    <Textarea
                      id="description"
                      placeholder="Estaba caminando por…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      rows={8}
                      className="resize-none leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">{description.length}/1000</p>
                  </div>
                )}

                {/* Step 3: Media */}
                {step === 3 && (
                  <div className="space-y-3 animate-fade-in">
                    <Label>Un fragmento del momento (opcional)</Label>
                    <p className="text-sm text-muted-foreground italic">
                      Una imagen, un sonido, un video. Solo si lo tienes — la palabra también basta.
                    </p>
                    <FileUpload
                      sensoryType={sensoryType}
                      onUpload={(url, type) => {
                        setMediaUrl(url);
                        setMediaType(type);
                      }}
                      currentFileUrl={mediaUrl}
                      currentFileType={mediaType}
                    />
                  </div>
                )}

                {/* Step 4: Tags + review */}
                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="tags">Palabras que lo evocan (opcional)</Label>
                      <p className="text-sm text-muted-foreground italic">
                        Para que otros puedan encontrar este momento cuando busquen algo similar.
                      </p>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="atardecer, silencio, mar…"
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
                      <p className="text-xs text-muted-foreground">{tags.length}/10</p>
                    </div>

                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
                      <p className="text-xs uppercase tracking-wider text-accent flex items-center gap-2">
                        <Leaf className="w-3 h-3" /> Listo para compartir
                      </p>
                      <p className="font-display text-lg italic">"{title || "—"}"</p>
                      <p className="text-xs text-muted-foreground">
                        {sensoryTypes.find(t => t.value === sensoryType)?.label} · {description.length} caracteres · {mediaUrl ? "con fragmento" : "solo palabras"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 pt-6 border-t border-border/40">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                      <ArrowLeft className="w-4 h-4" /> Atrás
                    </Button>
                  ) : (
                    <Button type="button" variant="ghost" onClick={() => navigate("/")} disabled={loading}>
                      Cancelar
                    </Button>
                  )}
                  <div className="flex-1" />
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      variant="hero"
                      onClick={() => setStep(step + 1)}
                      disabled={!canAdvance()}
                    >
                      Continuar <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button type="submit" variant="hero" disabled={loading}>
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
                      ) : (
                        <>{editId ? "Actualizar" : "Compartir momento"} <Leaf className="w-4 h-4" /></>
                      )}
                    </Button>
                  )}
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
