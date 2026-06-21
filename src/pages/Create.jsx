import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Settings2, ChevronDown, ChevronUp, Sliders, Mic2, LayoutList, Music, Clock, Repeat, Sparkles, Piano, GitBranch, Loader2 } from "lucide-react";
import PromptInput from "../components/generator/PromptInput";
import GenreSelector from "../components/generator/GenreSelector";
import MoodSliders from "../components/generator/MoodSliders";
import VocalSelector from "../components/generator/VocalSelector";
import StructureBuilder from "../components/generator/StructureBuilder";
import InstrumentSelector from "../components/generator/InstrumentSelector";
import AdvancedControls from "../components/generator/AdvancedControls";
import GeneratingOverlay from "../components/shared/GeneratingOverlay";
import InlineTrackPlayer from "../components/generator/InlineTrackPlayer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Create() {
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState("cinematic");
  const [mood, setMood] = useState({ energy: 50, complexity: 50, darkness: 30 });
  const [vocalType, setVocalType] = useState("none");
  const [structure, setStructure] = useState(["intro", "verse", "chorus", "verse", "chorus", "outro"]);
  const [bpm, setBpm] = useState(120);
  const [duration, setDuration] = useState(60);
  const [isLoopable, setIsLoopable] = useState(false);
  const [instruments, setInstruments] = useState(["piano", "drums", "bass"]);
  const [musicalKey, setMusicalKey] = useState("C");
  const [keyMode, setKeyMode] = useState("Major");
  const [melodyComplexity, setMelodyComplexity] = useState(50);
  const [harmonicComplexity, setHarmonicComplexity] = useState(50);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrack, setGeneratedTrack] = useState(null);
  const [appliedStyle, setAppliedStyle] = useState(null);

  const queryClient = useQueryClient();

  // Check for applied Style DNA
  React.useEffect(() => {
    const styleData = localStorage.getItem("applied_style_dna");
    if (styleData) {
      try {
        const style = JSON.parse(styleData);
        setGenre(style.genre);
        setMood(style.mood_settings);
        setVocalType(style.vocal_type);
        setStructure(style.structure);
        setBpm(style.bpm);
        setAppliedStyle(style.name);
        localStorage.removeItem("applied_style_dna");
      } catch (e) {}
    }
  }, []);

  const generateMutation = useMutation({
    onMutate: () => {
      setIsGenerating(true);
    },
    mutationFn: async () => {
      const desc = prompt.trim() || `${genre} music in ${musicalKey} ${keyMode} at ${bpm} BPM`;
      
      // Generate a title using LLM
      const titleResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a creative, short (2-4 words) song title for this music: "${desc}". Genre: ${genre}. Mood: energy ${mood.energy}/100, complexity ${mood.complexity}/100. Just return the title, nothing else.`,
      });

      // Generate cover art
      const coverResult = await base44.integrations.Core.GenerateImage({
        prompt: `Abstract album cover art for ${genre} music. ${desc}. Minimal, modern, dark background with vibrant ${genre === 'edm' ? 'neon purple and cyan' : genre === 'lofi' ? 'warm sunset tones' : genre === 'cinematic' ? 'gold and deep blue' : 'violet and emerald'} accents. No text, artistic, high quality.`,
      });

      // Generate actual music
      const musicResult = await base44.functions.invoke('generateMusic', {
        prompt: desc,
        genre,
        mood,
        duration,
        bpm,
        key: musicalKey,
        vocalType,
        structure,
        instruments,
        melodyComplexity,
        harmonicComplexity,
        isLoopable
      });

      const track = await base44.entities.Track.create({
        title: typeof titleResult === 'string' ? titleResult.trim().replace(/"/g, "") : `${genre} track`,
        prompt: desc,
        genre,
        mood: Object.keys(mood).reduce((acc, k) => {
          if (mood[k] > 60) return k;
          return acc;
        }, "calm"),
        bpm,
        key: musicalKey,
        key_mode: keyMode,
        instruments,
        melody_complexity: melodyComplexity,
        harmonic_complexity: harmonicComplexity,
        is_loopable: isLoopable,
        duration,
        structure,
        vocal_type: vocalType,
        energy: mood.energy,
        complexity: mood.complexity,
        darkness: mood.darkness,
        status: "completed",
        cover_url: coverResult?.url || "",
        audio_url: musicResult.data?.audio_url || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`,
        is_public: false,
        likes: 0,
        plays: 0,
      });

      return track;
    },
    onSuccess: (track) => {
      queryClient.invalidateQueries({ queryKey: ["tracks"] });
      setIsGenerating(false);
      setGeneratedTrack(track);
      toast.success("Track created! Listen below.");
    },
    onError: (error) => {
      setIsGenerating(false);
      const msg = error?.response?.data?.error 
        || error?.data?.error 
        || error?.message 
        || "Something went wrong. Please try again.";
      toast.error(msg);
      console.error("Generation failed:", error);
    },
  });

  return (
    <div className="min-h-screen pb-32">
      <AnimatePresence>
        {isGenerating && <GeneratingOverlay prompt={prompt} />}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Create Music</h1>
          <p className="text-sm text-zinc-500">Describe your vision and let AI compose it</p>
          {appliedStyle && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-300 text-xs">
              <Sparkles className="w-3 h-3" />
              Using style: {appliedStyle}
            </div>
          )}
        </motion.div>

        {/* Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onGenerate={() => generateMutation.mutate()}
            isGenerating={isGenerating}
          />
        </motion.div>

        {/* Genre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Genre</h2>
          </div>
          <GenreSelector selected={genre} onSelect={setGenre} />
        </motion.div>

        {/* Instruments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Piano className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Instruments</h2>
          </div>
          <InstrumentSelector selected={instruments} onChange={setInstruments} />
        </motion.div>

        {/* Mood */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Mood & Feel</h2>
          </div>
          <MoodSliders values={mood} onChange={setMood} />
        </motion.div>

        {/* Track Length */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Track Length
            </h3>
            <span className="text-xs text-zinc-500">{duration}s</span>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {[15, 30, 60, 120, 180].map((len) => (
              <button
                key={len}
                onClick={() => setDuration(len)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  duration === len
                    ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }`}
              >
                {len}s
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs text-zinc-400 flex items-center gap-2">
              <Repeat className="w-3.5 h-3.5" />
              Seamless Loop
            </label>
            <button
              onClick={() => setIsLoopable(!isLoopable)}
              className={`relative w-11 h-6 rounded-full transition-all ${
                isLoopable ? "bg-blue-500" : "bg-zinc-700"
              }`}
            >
              <motion.div
                animate={{ x: isLoopable ? 20 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full"
              />
            </button>
          </div>
        </motion.div>

        {/* Musical Theory Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Musical Theory</h2>
          </div>
          <AdvancedControls
            musicalKey={musicalKey}
            keyMode={keyMode}
            melodyComplexity={melodyComplexity}
            harmonicComplexity={harmonicComplexity}
            onKeyChange={setMusicalKey}
            onModeChange={setKeyMode}
            onMelodyChange={setMelodyComplexity}
            onHarmonicChange={setHarmonicComplexity}
          />
        </motion.div>

        {/* Advanced toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mx-auto"
        >
          <Settings2 className="w-4 h-4" />
          More Options
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.button>

        {/* Advanced */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Vocals */}
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-pink-400" />
                  <h2 className="text-sm font-semibold text-zinc-300">Vocals</h2>
                </div>
                <VocalSelector selected={vocalType} onSelect={setVocalType} />
              </div>

              {/* Structure */}
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutList className="w-4 h-4 text-sky-400" />
                  <h2 className="text-sm font-semibold text-zinc-300">Song Structure</h2>
                </div>
                <StructureBuilder structure={structure} onChange={setStructure} />
              </div>

              {/* BPM */}
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-300">Tempo (BPM)</h2>
                  <span className="text-sm tabular-nums text-blue-400 font-mono">{bpm}</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={200}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>60 - Slow</span>
                  <span>120 - Medium</span>
                  <span>200 - Fast</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        {!generatedTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center pt-2"
          >
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={isGenerating}
              className="gradient-purple text-white rounded-xl px-10 py-6 text-base font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-40"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Your Track...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Track
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Inline Player */}
        <AnimatePresence>
          {generatedTrack && (
            <InlineTrackPlayer
              track={generatedTrack}
              onDismiss={() => setGeneratedTrack(null)}
              onSwitchVersion={(updatedTrack) => setGeneratedTrack(updatedTrack)}
            />
          )}
        </AnimatePresence>

        {/* Create Another */}
        {generatedTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Button
              onClick={() => setGeneratedTrack(null)}
              variant="outline"
              className="text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-500 rounded-xl"
            >
              Create Another Track
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}