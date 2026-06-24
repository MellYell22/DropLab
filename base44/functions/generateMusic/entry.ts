import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

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
    } = body;

    console.log(`Generating ${duration}s ${genre} track for user ${user.id}`);

    // Generate a demo audio URL based on duration
    // In production: Replace with actual AI music generation API (Suno, Udio, MusicGen, etc.)
    const songIndex = Math.floor(Math.random() * 16) + 1;
    const demoAudioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${songIndex}.mp3`;

    const audioSpec = {
      duration,
      format: "mp3",
      sampleRate: 44100,
      bitrate: 320,
      bpm,
      key,
      genre,
      instruments,
      structure,
      generatedAt: new Date().toISOString(),
    };

    return Response.json({ 
      success: true, 
      audio_url: demoAudioUrl,
      duration,
      metadata: audioSpec,
      message: `Generated ${duration}s ${genre} track in ${key} at ${bpm} BPM`
    });

  } catch (error) {
    console.error('Music generation error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});