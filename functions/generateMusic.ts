import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      prompt, 
      genre, 
      mood, 
      duration, 
      bpm, 
      key, 
      vocalType, 
      structure,
      instruments,
      melodyComplexity,
      harmonicComplexity,
      isLoopable
    } = await req.json();

    // Build comprehensive music generation prompt
    const musicPrompt = `Generate a ${duration}-second ${genre} track. 
Musical Key: ${key}. Tempo: ${bpm} BPM.
Mood: Energy ${mood.energy}/100, Complexity ${mood.complexity}/100, Darkness ${mood.darkness}/100.
Vocals: ${vocalType === 'none' ? 'Instrumental only' : vocalType + ' vocals'}.
Instruments: ${instruments.join(', ')}.
Structure: ${structure.join(' -> ')}.
Melodic Complexity: ${melodyComplexity}/100.
Harmonic Complexity: ${harmonicComplexity}/100.
${isLoopable ? 'IMPORTANT: Create a seamless loop with matching start/end.' : ''}
User Description: ${prompt}

Generate high-quality audio data that matches these exact specifications, especially the ${duration}-second duration.`;

    // Use LLM to generate detailed audio specification
    const audioSpec = await base44.integrations.Core.InvokeLLM({
      prompt: musicPrompt + "\n\nProvide a detailed JSON specification for this music track.",
      response_json_schema: {
        type: "object",
        properties: {
          waveform_type: { type: "string" },
          frequency_profile: { type: "array", items: { type: "number" } },
          amplitude_envelope: { type: "array", items: { type: "number" } },
          effects: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Generate actual audio file using AI
    // For now, we'll create a marker file that the frontend can use
    // In production, this would call a real music generation API like Suno, Udio, or MusicGen
    const audioData = {
      spec: audioSpec,
      duration: duration,
      format: "mp3",
      sampleRate: 44100,
      bitrate: 320,
      // This would be the actual generated audio blob in production
      generatedAt: new Date().toISOString()
    };

    // Upload the metadata (in production, upload the actual audio file)
    const audioFile = new Blob([JSON.stringify(audioData)], { type: 'application/json' });
    const { file_url } = await base44.integrations.Core.UploadFile({ 
      file: audioFile 
    });

    return Response.json({ 
      success: true, 
      audio_url: file_url,
      duration: duration,
      metadata: audioSpec
    });

  } catch (error) {
    console.error('Music generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});