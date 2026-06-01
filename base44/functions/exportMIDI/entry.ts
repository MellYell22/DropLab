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

    // Generate MIDI data from track specifications
    const midiPrompt = `Convert this music track to MIDI format:
Genre: ${track.genre}, BPM: ${track.bpm}, Key: ${track.key}
Duration: ${track.duration}s
Structure: ${track.structure?.join(', ')}

Generate MIDI note sequences, timing, and controller data.`;

    const midiData = await base44.integrations.Core.InvokeLLM({
      prompt: midiPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          tracks: { 
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                notes: { type: "array" },
                channel: { type: "number" }
              }
            }
          },
          tempo: { type: "number" },
          timeSignature: { type: "string" }
        }
      }
    });

    // In production, convert to actual MIDI file format
    const midiBlob = new Blob([JSON.stringify(midiData)], { type: 'audio/midi' });
    const { file_url } = await base44.integrations.Core.UploadFile({ 
      file: midiBlob 
    });

    return Response.json({ 
      success: true,
      midi_url: file_url,
      data: midiData
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});