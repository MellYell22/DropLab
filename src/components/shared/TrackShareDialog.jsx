import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Share2, Instagram, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const genreColors = {
  pop: "#EC4899", edm: "#8B5CF6", hip_hop: "#F59E0B", rock: "#EF4444",
  classical: "#6366F1", lofi: "#06D6A0", ambient: "#38BDF8", cinematic: "#A78BFA",
  jazz: "#F97316", rnb: "#E879F9", folk: "#22C55E", metal: "#DC2626",
};

export default function TrackShareDialog({ track, onClose }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const color = genreColors[track.genre] || "#8B5CF6";
  const [coverLoaded, setCoverLoaded] = useState(false);
  const coverImgRef = useRef(null);

  useEffect(() => {
    if (track.cover_url) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        coverImgRef.current = img;
        setCoverLoaded(true);
      };
      img.src = track.cover_url;
    } else {
      setCoverLoaded(true);
    }
  }, [track.cover_url]);

  useEffect(() => {
    if (!coverLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0a14");
    bg.addColorStop(0.5, "#12121f");
    bg.addColorStop(1, "#0a0a14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle noise dots
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }

    // Cover art area
    const coverSize = 640;
    const coverX = (W - coverSize) / 2;
    const coverY = 280;

    if (coverImgRef.current) {
      // Draw cover image with rounded corners
      ctx.save();
      ctx.beginPath();
      const r = 32;
      ctx.moveTo(coverX + r, coverY);
      ctx.lineTo(coverX + coverSize - r, coverY);
      ctx.arcTo(coverX + coverSize, coverY, coverX + coverSize, coverY + r, r);
      ctx.lineTo(coverX + coverSize, coverY + coverSize - r);
      ctx.arcTo(coverX + coverSize, coverY + coverSize, coverX + coverSize - r, coverY + coverSize, r);
      ctx.lineTo(coverX + r, coverY + coverSize);
      ctx.arcTo(coverX, coverY + coverSize, coverX, coverY + coverSize - r, r);
      ctx.lineTo(coverX, coverY + r);
      ctx.arcTo(coverX, coverY, coverX + r, coverY, r);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(coverImgRef.current, coverX, coverY, coverSize, coverSize);
      ctx.restore();

      // Cover border glow
      ctx.beginPath();
      const r2 = 32;
      ctx.moveTo(coverX + r2, coverY);
      ctx.lineTo(coverX + coverSize - r2, coverY);
      ctx.arcTo(coverX + coverSize, coverY, coverX + coverSize, coverY + r2, r2);
      ctx.lineTo(coverX + coverSize, coverY + coverSize - r2);
      ctx.arcTo(coverX + coverSize, coverY + coverSize, coverX + coverSize - r2, coverY + coverSize, r2);
      ctx.lineTo(coverX + r2, coverY + coverSize);
      ctx.arcTo(coverX, coverY + coverSize, coverX, coverY + coverSize - r2, r2);
      ctx.lineTo(coverX, coverY + r2);
      ctx.arcTo(coverX, coverY, coverX + r2, coverY, r2);
      ctx.closePath();
      ctx.strokeStyle = color + "40";
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // Placeholder
      ctx.fillStyle = color + "15";
      ctx.beginPath();
      const r = 32;
      ctx.moveTo(coverX + r, coverY);
      ctx.lineTo(coverX + coverSize - r, coverY);
      ctx.arcTo(coverX + coverSize, coverY, coverX + coverSize, coverY + r, r);
      ctx.lineTo(coverX + coverSize, coverY + coverSize - r);
      ctx.arcTo(coverX + coverSize, coverY + coverSize, coverX + coverSize - r, coverY + coverSize, r);
      ctx.lineTo(coverX + r, coverY + coverSize);
      ctx.arcTo(coverX, coverY + coverSize, coverX, coverY + coverSize - r, r);
      ctx.lineTo(coverX, coverY + r);
      ctx.arcTo(coverX, coverY, coverX + r, coverY, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = color + "40";
      ctx.font = "bold 80px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("♪", W / 2, coverY + coverSize / 2 + 25);
    }

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    const title = track.title || "Untitled Track";
    const titleLines = wrapText(ctx, title, W - 160);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, coverY + coverSize + 80 + i * 70);
    });

    // Genre badge
    const genreY = coverY + coverSize + 80 + titleLines.length * 70 + 40;
    const genreText = (track.genre || "").replace("_", " ").toUpperCase();
    const genreWidth = ctx.measureText(genreText).width + 60;
    const badgeX = W / 2 - genreWidth / 2;
    ctx.fillStyle = color + "20";
    ctx.beginPath();
    ctx.roundRect(badgeX, genreY - 28, genreWidth, 48, 24);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(genreText, W / 2, genreY + 6);

    // DropLab branding
    const brandY = H - 300;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 36px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Created with DropLab", W / 2, brandY);

    ctx.fillStyle = "#888";
    ctx.font = "22px Inter, system-ui, sans-serif";
    ctx.fillText("AI-powered music generation", W / 2, brandY + 48);

    // Decorative waveform
    const wfY = brandY + 100;
    const wfBars = 40;
    const barW = (W - 120) / wfBars;
    for (let i = 0; i < wfBars; i++) {
      const h = 6 + Math.sin(i * 0.5) * 12 + Math.random() * 20;
      const x = 60 + i * barW + 1;
      ctx.fillStyle = color + "60";
      ctx.beginPath();
      ctx.roundRect(x, wfY - h / 2, barW - 3, h, 4);
      ctx.fill();
    }

    // Bottom glow
    const glow = ctx.createRadialGradient(W / 2, H, 200, W / 2, H, W);
    glow.addColorStop(0, color + "10");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, H - 600, W, 600);

    setImageUrl(canvas.toDataURL("image/png"));
  }, [coverLoaded, color, track]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${track.title || "track"}-story.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;
    const blob = await (await fetch(imageUrl)).blob();
    const file = new File([blob], `${track.title || "track"}-story.png`, { type: "image/png" });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: track.title,
          text: `Listen to "${track.title}" on DropLab!`,
          files: [file],
        });
      } catch {}
    } else {
      handleDownload();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/Explore");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Instagram className="w-4 h-4" style={{ color }} />
            Share to Stories
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 flex justify-center">
          <canvas ref={canvasRef} className="hidden" />
          {imageUrl ? (
            <div className="rounded-xl overflow-hidden shadow-2xl" style={{ width: 240, height: 426, aspectRatio: "9/16" }}>
              <img src={imageUrl} alt="Story preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center" style={{ width: 240, height: 426, background: "#12121f" }}>
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2 border-t border-white/5">
          <Button
            onClick={handleDownload}
            className="w-full gap-2 bg-white text-black hover:bg-zinc-200"
          >
            <Download className="w-4 h-4" />
            Download Story Image
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full gap-2 border-white/10 text-white hover:bg-white/5"
          >
            <Share2 className="w-4 h-4" />
            Share via Apps
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="ghost"
            className="w-full gap-2 text-zinc-400 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Link Copied!" : "Copy Link"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? currentLine + " " + word : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [text];
}