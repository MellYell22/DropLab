import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Music, Compass, Library } from "lucide-react";

const bottomNavItems = [
  { name: "Home", icon: Sparkles, page: "Home" },
  { name: "Create", icon: Music, page: "Create" },
  { name: "Library", icon: Library, page: "Library" },
  { name: "Explore", icon: Compass, page: "Explore" },
];

export default function BottomNav({ currentPageName, onTabChange }) {
  const navigate = useNavigate();

  const handleTab = (page) => {
    if (onTabChange) {
      onTabChange(page);
    }
    navigate(`/${page}`);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 glass-strong border-t border-white/5 flex items-center justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPageName === item.page;
        return (
          <button
            key={item.name}
            onClick={() => handleTab(item.page)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all select-none min-h-[44px] min-w-[44px] justify-center ${
              isActive
                ? "text-blue-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}