import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Credit check: one credit per generation, block if zero
    const currentCredits = user.credits || 0;
    if (currentCredits < 1) {
      return Response.json({ error: 'You need at least 1 credit to generate a track.', code: 'INSUFFICIENT_CREDITS' }, { status: 402 });
    }
    await base44.asServiceRole.entities.User.update(user.id, { credits: currentCredits - 1 });
    console.log(`Deducted 1 credit from user ${user.id}. Balance: ${currentCredits} -> ${currentCredits - 1}`);

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

    const energy = mood?.energy ?? 50;
    const isCalm = energy <= 35 || bpm <= 85;
    console.log(`Generating ${duration}s ${genre} track at ${bpm} BPM (energy ${energy}, calm=${isCalm}) for user ${user.id}`);

    // Deterministic fallback: select a demo track based on BPM/energy
    // so calm/slow requests never get an upbeat random track.
    // SoundHelix songs 1-16 vary in style; split into calmer vs upbeat pools.
    const calmPool = [2, 5, 7, 9, 11, 13];
    const upbeatPool = [1, 3, 4, 6, 8, 10, 12, 14, 15, 16];
    const pool = isCalm ? calmPool : upbeatPool;
    // Deterministic pick: same settings → same track
    const songIndex = pool[bpm % pool.length];
    const demoAudioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${songIndex}.mp3`;
    const usedFallback = true;

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
      mood,
      vocalType,
      receivedPrompt: prompt,
      usedFallbackAudio: usedFallback,
      isCalm,
      generatedAt: new Date().toISOString(),
    };

    const message = usedFallback
      ? `Fallback demo audio used — no real AI music provider configured yet. Selected a ${isCalm ? "calm/slow" : "standard"} demo track matching ${bpm} BPM, energy ${energy}.`
      : `Generated ${duration}s ${genre} track in ${key} at ${bpm} BPM`;

    return Response.json({
      success: true,
      audio_url: demoAudioUrl,
      duration,
      metadata: audioSpec,
      message,
      usedFallbackAudio: usedFallback,
    });

  } catch (error) {
    console.error('Music generation error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});