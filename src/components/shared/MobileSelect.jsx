import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";

/**
 * MobileSelect - Renders as bottom sheet (Drawer) on mobile, standard Select on desktop.
 * Props mirror Select: value, onValueChange, options, placeholder, label, className
 */
export default function MobileSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "Select...",
  label,
  className = "",
  triggerClassName = "",
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    const selected = options.find((o) => o.value === value);
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            className={`flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white ${triggerClassName}`}
          >
            <span className={!value ? "text-zinc-500" : ""}>
              {selected?.label || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="glass-strong border-white/10 max-h-[60vh]">
          <DrawerHeader>
            <DrawerTitle className="text-white text-base">{label || placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-1 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-colors min-h-[44px] ${
                  value === option.value
                    ? "bg-violet-500/15 text-violet-300"
                    : "text-zinc-300 hover:bg-white/5"
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="h-4 w-4 text-violet-400" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`h-10 bg-white/5 border-white/10 text-white ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[hsl(240,10%,7%)] text-white">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}