import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SensoryData {
  visual: number;
  auditivo: number;
  tacto: number;
  olfato: number;
  gusto: number;
}

export function SensoryMapChart() {
  const { user } = useAuth();
  const [data, setData] = useState<SensoryData>({
    visual: 0,
    auditivo: 0,
    tacto: 0,
    olfato: 0,
    gusto: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch user's experiences grouped by sensory type
      const { data: experiences } = await supabase
        .from('experiences')
        .select('sensory_type')
        .eq('creator_id', user.id);

      // Fetch user's votes grouped by sensory type
      const { data: votes } = await supabase
        .from('experience_votes')
        .select('experience_id')
        .eq('user_id', user.id);

      if (votes && votes.length > 0) {
        const expIds = votes.map(v => v.experience_id);
        const { data: votedExps } = await supabase
          .from('experiences')
          .select('sensory_type')
          .in('id', expIds);

        if (votedExps) {
          experiences?.push(...votedExps);
        }
      }

      // Count by sensory type
      const counts: SensoryData = {
        visual: 0,
        auditivo: 0,
        tacto: 0,
        olfato: 0,
        gusto: 0
      };

      experiences?.forEach(exp => {
        const type = exp.sensory_type as keyof SensoryData;
        if (type in counts) {
          counts[type]++;
        }
      });

      setData(counts);
    };

    fetchData();
  }, [user]);

  const maxValue = Math.max(...Object.values(data), 10);
  const sensoryTypes = [
    { key: 'visual',    label: 'Visual 👁️',   color: 'hsl(var(--imagination))' },
    { key: 'auditivo',  label: 'Auditivo 👂', color: 'hsl(var(--secondary))' },
    { key: 'tacto',     label: 'Tacto ✋',    color: 'hsl(var(--sensory))' },
    { key: 'olfato',    label: 'Olfato 👃',   color: 'hsl(var(--sand))' },
    { key: 'gusto',     label: 'Gusto 👅',    color: 'hsl(var(--accent))' }
  ];

  const mostExplored = sensoryTypes.reduce((max, type) => 
    data[type.key as keyof SensoryData] > data[max.key as keyof SensoryData] ? type : max
  );

  const leastExplored = sensoryTypes.reduce((min, type) => 
    data[type.key as keyof SensoryData] < data[min.key as keyof SensoryData] ? type : min
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/40 bg-card/60 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">Atlas personal</p>
        <h3 className="font-display text-2xl mb-3 tracking-tight">Tu paisaje sensorial</h3>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed italic">
          Cada momento que compartes o con el que resuenas deja una huella en uno de los cinco sentidos.
          Este mapa te muestra cómo habitas el mundo — qué dimensión exploras más, cuál te falta por descubrir.
        </p>

        <div className="space-y-4">
          {sensoryTypes.map(type => {
            const value = data[type.key as keyof SensoryData];
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

            return (
              <div key={type.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{type.label}</span>
                  <span className="text-muted-foreground">{value} experiencias</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: type.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 border-border/40 bg-card/60">
          <p className="text-xs uppercase tracking-wider text-accent mb-2">Donde más habitas</p>
          <div className="text-4xl mb-1">{mostExplored.label.split(' ')[1]}</div>
          <p className="text-sm text-muted-foreground italic">
            {data[mostExplored.key as keyof SensoryData]} momentos en {mostExplored.label.split(' ')[0].toLowerCase()}
          </p>
        </Card>

        <Card className="p-6 border-border/40 bg-card/60">
          <p className="text-xs uppercase tracking-wider text-accent mb-2">Una invitación</p>
          <div className="text-4xl mb-1">{leastExplored.label.split(' ')[1]}</div>
          <p className="text-sm text-muted-foreground italic">
            Explora más este sentido — solo {data[leastExplored.key as keyof SensoryData]} momento(s) hasta ahora.
          </p>
        </Card>
      </div>
    </div>
  );
}
