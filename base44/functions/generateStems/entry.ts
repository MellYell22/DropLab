import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { track_id } = await req.json();
    
    const track = await base44.entities.Track.get(track_id);
    
    if (!track || track.created_by !== user.email) {
      return Response.json({ error: 'Track not found' }, { status: 404 });
    }

    // AI-powered stem separation
    const stemPrompt = `Separate the following music track into individual stems:
Genre: ${track.genre}
Duration: ${track.duration}s
Instruments: Extract drums, bass, melody, harmony, vocals (if present)

Provide specifications for each stem track.`;

    const stems = await base44.integrations.Core.InvokeLLM({
      prompt: stemPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          drums: { type: "object" },
          bass: { type: "object" },
          melody: { type: "object" },
          harmony: { type: "object" },
          vocals: { type: "object" }
        }
      }
    });

    return Response.json({ 
      success: true,
      stems: stems,
      track_id: track_id
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});