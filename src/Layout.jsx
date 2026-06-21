import React, { useState, useEffect, Suspense } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { PAGES } from "./pages.config";
import {
  Sparkles,
  Music,
  Compass,
  Library,
  User,
  Menu,
  X,
  LogOut,
  Crown,
  ShoppingBag,
  ChevronLeft,
  Coins,
} from "lucide-react";
import BottomNav from "./components/shared/BottomNav";
import PlayerBar from "./components/shared/PlayerBar";

const navItems = [
  { name: "Home", icon: Sparkles, page: "Home" },
  { name: "Create", icon: Music, page: "Create" },
  { name: "Library", icon: Library, page: "Library" },
  { name: "Explore", icon: Compass, page: "Explore" },
  { name: "Credits", icon: Coins, page: "Credits" },
  { name: "Marketplace", icon: ShoppingBag, page: "Marketplace" },
  { name: "Style DNA", icon: Crown, page: "StyleDNA" },
  { name: "Analytics", icon: User, page: "Analytics" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Tab stack preservation for primary tabs on mobile
  const primaryTabs = ["Home", "Create", "Library", "Explore"];

  const isRootTab = primaryTabs.includes(currentPageName);
  const [visitedTabs, setVisitedTabs] = useState(() => {
    const initial = {};
    primaryTabs.forEach((t) => { initial[t] = false; });
    initial[currentPageName] = true;
    return initial;
  });

  // Track visited tabs
  useEffect(() => {
    if (primaryTabs.includes(currentPageName)) {
      setVisitedTabs((prev) => ({ ...prev, [currentPageName]: true }));
    }
  }, [currentPageName]);

  const handleTabChange = (page) => {
    setVisitedTabs((prev) => ({ ...prev, [page]: true }));
  };

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: Infinity,
  });

  // Pass playback state through React context
  useEffect(() => {
    window.__playerState = { currentTrack, setCurrentTrack, isPlaying, setIsPlaying };
  }, [currentTrack, isPlaying]);

  return (
    <div className="min-h-screen text-white noise-bg">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06]" style={{ paddingTop: "env(safe-area-inset-top, 0px)", background: "rgba(8, 14, 32, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Back button (mobile, non-root pages) */}
          <div className="flex items-center gap-2">
            {!isRootTab && (
              <button
                onClick={() => window.history.back()}
                className="md:hidden p-1 -ml-1 rounded-lg hover:bg-white/5 text-[#94A3B8]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #1D6FBB, #3093A0)", boxShadow: "0 4px 16px rgba(48, 147, 160, 0.3)" }}>
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight hidden sm:block text-white">DropLab</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#3093A0]/15 text-[#3093A0]"
                      : "text-[#94A3B8] hover:text-[#CBD5E1] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #1D6FBB, #3093A0)" }}>
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="text-xs text-[#94A3B8] hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-[#94A3B8]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile menu - rendered outside sticky header as overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-30 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden fixed top-14 left-0 right-0 z-40 border-b border-white/[0.06]" style={{ background: "rgba(12, 4, 50, 0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div className="p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[#3093A0]/15 text-[#3093A0]"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPageName}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="relative z-10 md:pb-0 pb-20"
        >
          {/* Tab stack preservation: on mobile, keep all primary tab pages mounted */}
          {isMobile && primaryTabs.includes(currentPageName) ? (
            <>
              {primaryTabs.map((tab) => {
                const TabComponent = PAGES[tab];
                const isActive = tab === currentPageName;
                const hasVisited = visitedTabs[tab];
                if (!hasVisited) return null;
                return (
                  <div key={tab} style={{ display: isActive ? "block" : "none" }}>
                    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-[#3093A0]/20 border-t-[#3093A0] rounded-full animate-spin" /></div>}>
                      <TabComponent />
                    </Suspense>
                  </div>
                );
              })}
            </>
          ) : (
            children
          )}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-3 text-[11px] text-[#64748B]" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}>
        Created by AA Designs
      </footer>

      {/* Bottom navigation (mobile only) */}
      <BottomNav currentPageName={currentPageName} onTabChange={handleTabChange} />

      {/* Player */}
      <PlayerBar
        track={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
      />
    </div>
  );
}