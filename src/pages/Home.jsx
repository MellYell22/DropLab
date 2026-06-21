import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { Sparkles, Music, Headphones, Sliders, Download, Mic2, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import WaveformVisualizer from "../components/shared/WaveformVisualizer";

const features = [
  { icon: Sparkles, title: "AI-Powered", description: "State-of-the-art models generate studio-quality music from text", color: "#8B5CF6" },
  { icon: Sliders, title: "Total Control", description: "Fine-tune genre, mood, tempo, vocals, and song structure", color: "#F59E0B" },
  { icon: Download, title: "Stem Export", description: "Download individual stems for drums, bass, melody, and vocals", color: "#06D6A0" },
  { icon: Shield, title: "Copyright Free", description: "Every track is 100% original and safe for commercial use", color: "#38BDF8" },
  { icon: Mic2, title: "AI Vocals", description: "Add male, female, choir, rap, or robotic vocals to any track", color: "#EC4899" },
  { icon: Globe, title: "Community", description: "Share your creations and discover music from other creators", color: "#6366F1" },
];

const genres = [
  { name: "Cinematic", color: "#A78BFA", emoji: "🎬" },
  { name: "Lo-Fi", color: "#06D6A0", emoji: "🌿" },
  { name: "EDM", color: "#8B5CF6", emoji: "⚡" },
  { name: "Hip Hop", color: "#F59E0B", emoji: "🎤" },
  { name: "Classical", color: "#6366F1", emoji: "🎻" },
  { name: "Ambient", color: "#38BDF8", emoji: "☁️" },
];

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div className="min-h-screen pb-32 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 flex flex-col items-center text-center radial-glow">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(108, 92, 231, 0.08)" }} />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ background: "rgba(90, 75, 209, 0.06)" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-black to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs text-[#8B7CFF]"
          >
            <Zap className="w-3 h-3" />
            AI Music Generation
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold leading-[1.1] tracking-tight">
            <span className="text-white">Create Music</span>
            <br />
            <span className="gradient-text">With Your Words</span>
          </h1>

          <p className="text-base sm:text-lg text-[#CBD5E1] max-w-lg mx-auto leading-relaxed">
            Transform text prompts into studio-quality tracks. Full control over genre, mood, vocals, and structure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={createPageUrl("Create")}>
              <Button className="gradient-purple text-white px-8 py-6 text-base rounded-2xl transition-all" style={{ boxShadow: "0 8px 32px rgba(108, 92, 231, 0.22)" }}>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating — Free
              </Button>
            </Link>
            <Link to={createPageUrl("Explore")}>
              <Button variant="ghost" className="text-[#94A3B8] hover:text-white px-8 py-6 text-base rounded-2xl">
                <Headphones className="w-5 h-5 mr-2" />
                Explore Tracks
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Waveform decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 w-full max-w-2xl mt-12"
        >
          <WaveformVisualizer isPlaying={true} color="#6C5CE7" bars={60} height={50} />
        </motion.div>
      </section>

      {/* Genre Showcase */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Every Genre. Every Mood.</h2>
            <p className="text-sm text-[#CBD5E1] mt-2">From lo-fi beats to cinematic orchestrals</p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {genres.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs font-medium" style={{ color: g.color }}>{g.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Everything You Need</h2>
            <p className="text-sm text-[#CBD5E1] mt-2">Professional music creation, simplified</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="glass rounded-2xl p-6 space-y-3 hover:bg-white/[0.03] transition-all group cursor-default"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: `${feature.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to create?</h2>
          <p className="text-sm text-[#CBD5E1]">
            Start generating copyright-free music in seconds. No credit card required.
          </p>
          <Link to={createPageUrl("Create")}>
            <Button className="gradient-purple text-white px-8 py-6 text-base rounded-2xl transition-all" style={{ boxShadow: "0 8px 32px rgba(108, 92, 231, 0.22)" }}>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Your First Track
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}