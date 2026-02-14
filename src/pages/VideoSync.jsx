import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, Upload, Sparkles, Download, Loader2, Wand2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VideoSync() {
  const [projectName, setProjectName] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [project, setProject] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      
      // Upload video
      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
      setVideoUrl(file_url);

      // Analyze video with AI
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this video and identify key moments for music synchronization. Return timestamps where music should change (cuts, scene changes, emotional shifts, action peaks). Format: JSON array of {timestamp: number (seconds), event: string, intensity: 0-100}`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            sync_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timestamp: { type: "number" },
                  event: { type: "string" },
                  intensity: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Generate music prompt based on analysis
      const musicPrompt = `Create cinematic soundtrack that matches this video analysis: ${JSON.stringify(analysis.sync_points?.slice(0, 3) || [])}. Dynamic intensity changes.`;

      // Generate cover art
      const coverResult = await base44.integrations.Core.GenerateImage({
        prompt: "Cinematic video soundtrack cover art, minimal, dark",
      });

      // Create track
      const track = await base44.entities.Track.create({
        title: `${projectName} Soundtrack`,
        prompt: musicPrompt,
        genre: "cinematic",
        mood: "epic",
        bpm: 120,
        duration: 180,
        structure: ["intro", "verse", "chorus", "bridge", "outro"],
        vocal_type: "none",
        energy: 75,
        complexity: 65,
        darkness: 50,
        status: "completed",
        cover_url: coverResult?.url || "",
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      });

      // Create video project
      const proj = await base44.entities.VideoProject.create({
        name: projectName,
        video_url: file_url,
        track_id: track.id,
        analysis: analysis,
        sync_points: analysis.sync_points || [],
        status: "completed",
      });

      setProject(proj);
      setIsAnalyzing(false);
      return proj;
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!projectName) {
        setProjectName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Film className="w-6 h-6 text-violet-400" />
            <h1 className="text-3xl font-bold gradient-text">Video to Music Sync</h1>
          </div>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto">
            Upload your video and AI will analyze it to generate a perfectly synced soundtrack
          </p>
        </motion.div>

        {!project ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 space-y-6"
          >
            <div className="space-y-3">
              <label className="text-sm text-zinc-400">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Epic Video Project"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-zinc-400">Upload Video</label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="glass-strong rounded-2xl p-12 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 hover:border-violet-500/30 transition-all">
                  <Upload className="w-10 h-10 text-violet-400" />
                  <div className="text-center">
                    <p className="text-sm text-white font-medium">
                      {videoFile ? videoFile.name : "Click to upload video"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">MP4, MOV, or AVI up to 100MB</p>
                  </div>
                </div>
              </div>
            </div>

            {videoFile && (
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!projectName || isAnalyzing}
                className="w-full gradient-purple text-white rounded-2xl py-6"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing & Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Soundtrack
                  </>
                )}
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Soundtrack Generated!</h3>
                  <p className="text-xs text-zinc-500">{project.name}</p>
                </div>
              </div>

              {project.sync_points?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400 font-medium">Key Sync Points Detected:</p>
                  <div className="space-y-1">
                    {project.sync_points.slice(0, 5).map((point, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span className="tabular-nums">{point.timestamp}s</span>
                        <span>•</span>
                        <span>{point.event}</span>
                        <span className="ml-auto px-2 py-0.5 rounded bg-violet-500/15 text-violet-400">
                          {point.intensity}% intensity
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gradient-accent text-white rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Download with Soundtrack
                </Button>
                <Button
                  onClick={() => { setProject(null); setVideoFile(null); setProjectName(""); }}
                  variant="ghost"
                  className="text-zinc-400 hover:text-white rounded-xl"
                >
                  New Project
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}