import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY no configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === 'string' ? body.title.slice(0, 200) : '';
    const description = typeof body.description === 'string' ? body.description.slice(0, 4000) : '';
    const sensoryType = typeof body.sensoryType === 'string' ? body.sensoryType : '';

    if (!title && !description) {
      return new Response(JSON.stringify({ error: 'Se requiere título o descripción' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `Eres el "Curador sensorial" de Imaginar, una plataforma donde las personas comparten experiencias humanas a través de los sentidos (visual, auditivo, tacto, olfato, gusto).
Tu rol es leer una experiencia y devolver una breve interpretación contemplativa y poética en español:
- Una emoción dominante (1 palabra: Serenidad, Nostalgia, Asombro, Inspiración, Energía, Contemplación, Alegría, Melancolía).
- 2-4 sentidos relacionados.
- Una invitación breve (máx 2 frases) que conecte al lector con la experiencia.
- 3 sugerencias de qué buscar o vivir después, relacionadas sensorialmente.
Responde SIEMPRE en JSON estricto con la forma: { "emocion": string, "sentidos": string[], "invitacion": string, "sugerencias": string[] }`;

    const userPrompt = `Sentido principal: ${sensoryType || 'no especificado'}
Título: ${title}
Descripción: ${description}`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Demasiadas peticiones. Intenta en unos segundos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA agotados.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('AI gateway error', aiRes.status, errText);
      return new Response(JSON.stringify({ error: 'Error consultando IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content ?? '{}';
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { invitacion: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('curate-experience error', e);
    return new Response(JSON.stringify({ error: 'Error inesperado' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});