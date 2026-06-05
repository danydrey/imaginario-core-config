import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, X, FileVideo, FileAudio, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  sensoryType: string;
  onUpload: (url: string, type: string) => void;
  currentFileUrl?: string | null;
  currentFileType?: string | null;
}

const getAcceptedTypes = (sensoryType: string) => {
  switch (sensoryType) {
    case "visual":
      return { accept: "image/*", types: ["image/jpeg", "image/png", "image/gif", "image/webp"], label: "Imágenes" };
    case "auditivo":
      return { accept: "audio/*", types: ["audio/mpeg", "audio/wav", "audio/ogg"], label: "Audio" };
    case "tacto":
      return { accept: "image/*,video/*", types: ["image/jpeg", "image/png", "video/mp4", "video/webm"], label: "Imágenes o Videos" };
    case "olfato":
      return { accept: "image/*", types: ["image/jpeg", "image/png", "image/webp"], label: "Imágenes descriptivas" };
    case "gusto":
      return { accept: "image/*", types: ["image/jpeg", "image/png", "image/webp"], label: "Imágenes" };
    default:
      return { accept: "*", types: [], label: "Archivos" };
  }
};

export function FileUpload({ sensoryType, onUpload, currentFileUrl, currentFileType }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentFileUrl || null);
  const [fileType, setFileType] = useState<string | null>(currentFileType || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = getAcceptedTypes(sensoryType);
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("El archivo es demasiado grande. Máximo 20MB.");
      return;
    }

    // Validate file type
    if (acceptedTypes.types.length > 0 && !acceptedTypes.types.includes(file.type)) {
      toast.error(`Tipo de archivo no válido. Solo se permiten: ${acceptedTypes.label}`);
      return;
    }

    try {
      setUploading(true);

      // Get current user to scope storage path to their folder (required by RLS)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión para subir archivos");
        return;
      }

      // Create file path scoped to user folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('experience-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('experience-media')
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      setFileType(file.type);
      onUpload(data.publicUrl, file.type);
      
      toast.success("Archivo cargado exitosamente");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error("Error al cargar el archivo");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setPreview(null);
    setFileType(null);
    onUpload("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const renderPreview = () => {
    if (!preview || !fileType) return null;

    if (fileType.startsWith('image/')) {
      return (
        <div className="relative rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    if (fileType.startsWith('audio/')) {
      return (
        <div className="relative">
          <audio controls className="w-full">
            <source src={preview} type={fileType} />
          </audio>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-2"
            onClick={removeFile}
          >
            <X className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <div className="relative">
          <video controls className="w-full h-48 rounded-lg">
            <source src={preview} type={fileType} />
          </video>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={removeFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return null;
  };

  if (!sensoryType) return null;

  return (
    <div className="space-y-2">
      <Label>Archivo Multimedia (Opcional)</Label>
      
      {preview ? (
        renderPreview()
      ) : (
        <Card className="p-6 border-dashed border-2">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              {sensoryType === "visual" && <ImageIcon className="w-6 h-6" />}
              {sensoryType === "auditivo" && <FileAudio className="w-6 h-6" />}
              {sensoryType === "tacto" && <FileVideo className="w-6 h-6" />}
              {(sensoryType === "olfato" || sensoryType === "gusto") && <ImageIcon className="w-6 h-6" />}
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">
                Sube {acceptedTypes.label}
              </p>
              <p className="text-xs text-muted-foreground">
                Máximo 20MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes.accept}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>Subiendo...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {sensoryType === "auditivo" && (
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong>Nota legal:</strong> Asegúrate de tener los derechos o permisos necesarios para compartir cualquier contenido musical. Respeta los derechos de autor.
          </p>
        </div>
      )}
    </div>
  );
}
