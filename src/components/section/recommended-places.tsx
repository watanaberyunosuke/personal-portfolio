"use client";

import RecommendedPlacesMap from "@/components/section/recommended-places-map";
import { RECOMMENDED_PLACES } from "@/data/recommended-places";
import { cn } from "@/lib/utils";
import { ExternalLink, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

export default function RecommendedPlaces() {
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    RECOMMENDED_PLACES[0]?.id ?? ""
  );

  const selectedPlace = useMemo(
    () =>
      RECOMMENDED_PLACES.find((place) => place.id === selectedPlaceId) ??
      RECOMMENDED_PLACES[0],
    [selectedPlaceId]
  );

  if (!selectedPlace) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-bold tracking-tight">Places I Recommend</h2>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          A living map of places I send people when they ask where to work, walk,
          learn, or get a good coffee around Melbourne.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <RecommendedPlacesMap place={selectedPlace} />

        <div className="flex min-h-0 flex-col gap-4">
          <div className="rounded-3xl border bg-background/70 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex size-12 flex-none items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <MapPin className="size-6" aria-hidden />
              </div>
              <div className="min-w-0 space-y-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {selectedPlace.category}
                  </div>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight">
                    {selectedPlace.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedPlace.city}, {selectedPlace.country}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedPlace.summary}
                </p>
                <p className="rounded-2xl border bg-muted/40 p-4 text-sm leading-relaxed">
                  {selectedPlace.tip}
                </p>
                <a
                  href={selectedPlace.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/75"
                >
                  Visit website
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {RECOMMENDED_PLACES.map((place) => {
              const isSelected = place.id === selectedPlace.id;

              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-200",
                    "hover:border-primary/30 hover:bg-background hover:shadow-sm",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                      : "border-border bg-background/60"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {place.name}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-xs",
                          isSelected
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        )}
                      >
                        {place.category} - {place.city}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "mt-1 size-2 flex-none rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-primary/40"
                      )}
                      aria-hidden
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
