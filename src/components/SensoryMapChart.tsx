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
    { key: 'visual', label: 'Visual 👁️', color: 'hsl(263, 70%, 60%)' },
    { key: 'auditivo', label: 'Auditivo 👂', color: 'hsl(200, 70%, 60%)' },
    { key: 'tacto', label: 'Tacto ✋', color: 'hsl(142, 70%, 45%)' },
    { key: 'olfato', label: 'Olfato 👃', color: 'hsl(43, 96%, 56%)' },
    { key: 'gusto', label: 'Gusto 👅', color: 'hsl(0, 72%, 60%)' }
  ];

  const mostExplored = sensoryTypes.reduce((max, type) => 
    data[type.key as keyof SensoryData] > data[max.key as keyof SensoryData] ? type : max
  );

  const leastExplored = sensoryTypes.reduce((min, type) => 
    data[type.key as keyof SensoryData] < data[min.key as keyof SensoryData] ? type : min
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Tu Exploración Sensorial</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          El Mapa Sensorial visualiza tu exploración a través de las cinco dimensiones sensoriales. 
          Cada experiencia creada o con la que interactúas añade un punto en tu mapa personal, 
          mostrando tu balance sensorial único.
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
        <Card className="p-6">
          <h4 className="font-semibold mb-2">Sentido Más Explorado</h4>
          <div className="text-3xl mb-1">{mostExplored.label.split(' ')[1]}</div>
          <p className="text-sm text-muted-foreground">
            {data[mostExplored.key as keyof SensoryData]} experiencias en {mostExplored.label.split(' ')[0]}
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-2">Sentido Menos Explorado</h4>
          <div className="text-3xl mb-1">{leastExplored.label.split(' ')[1]}</div>
          <p className="text-sm text-muted-foreground">
            {data[leastExplored.key as keyof SensoryData]} experiencias en {leastExplored.label.split(' ')[0]}
          </p>
        </Card>
      </div>
    </div>
  );
}
