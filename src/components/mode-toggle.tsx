"use client";

import { Button } from "@/components/ui/button";
import { LaptopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { readonly className?: string }) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const selectedTheme = mounted ? theme ?? "system" : "system";
  const activeTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";
  const nextTheme =
    selectedTheme === "light"
      ? "dark"
      : selectedTheme === "dark"
      ? "system"
      : "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-9", className)}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Theme: ${selectedTheme}. Switch to ${nextTheme} mode`}
    >
      {selectedTheme === "system" ? (
        <LaptopIcon className="h-[1.2rem] w-[1.2rem]" />
      ) : activeTheme === "dark" ? (
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Cycle theme</span>
    </Button>
  );
}
