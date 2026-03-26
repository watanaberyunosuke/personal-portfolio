"use client";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { readonly className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const activeTheme = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-9", className)}
      onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${activeTheme === "dark" ? "light" : "dark"} mode`}
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
