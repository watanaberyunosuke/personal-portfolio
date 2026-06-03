export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[calc(100dvh-12rem)] w-full items-center justify-center"
    >
      <div className="w-full max-w-3xl space-y-10">
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="relative size-12 flex-none rounded-full border border-border bg-background shadow-sm"
          >
            <div className="absolute inset-2 rounded-full border-2 border-muted" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Loading</p>
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-pulse" />
              <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-pulse [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-muted-foreground/70 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="h-28 rounded-lg border bg-card/70 p-6 shadow-sm">
            <div className="h-5 w-40 rounded bg-muted animate-pulse" />
            <div className="mt-5 space-y-3">
              <div className="h-3 w-full rounded bg-muted animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-24 rounded-lg border bg-card/70 p-5 shadow-sm">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-3 w-4/5 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-24 rounded-lg border bg-card/70 p-5 shadow-sm">
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-3 w-3/4 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
