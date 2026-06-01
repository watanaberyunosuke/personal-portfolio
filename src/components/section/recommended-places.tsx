"use client";

import RecommendedPlacesMap from "@/components/section/recommended-places-map";
import { cn } from "@/lib/utils";
import type { RecommendedPlace } from "@/types/recommended-place";
import { ExternalLink, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

interface RecommendedPlacesProps {
  readonly places: readonly RecommendedPlace[];
}

export default function RecommendedPlaces({ places }: RecommendedPlacesProps) {
  const hasPlaces = places.length > 0;
  const countryViews = useMemo(
    () =>
      Array.from(
        places.reduce((countries, place) => {
          const countryPlaces = countries.get(place.country) ?? [];
          countryPlaces.push(place);
          countries.set(place.country, countryPlaces);
          return countries;
        }, new Map<string, RecommendedPlace[]>())
      ).map(([country, countryPlaces]) => ({
        country,
        places: countryPlaces,
      })),
    [places]
  );

  const [selectedCountry, setSelectedCountry] = useState(
    countryViews[0]?.country ?? ""
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState(
    countryViews[0]?.places[0]?.id ?? ""
  );

  const activeCountryView =
    countryViews.find((view) => view.country === selectedCountry) ??
    countryViews[0];

  const countryPlaces = activeCountryView?.places ?? [];

  const selectedPlace =
    countryPlaces.find((place) => place.id === selectedPlaceId) ??
    countryPlaces[0];

  function selectCountry(country: string) {
    const nextView = countryViews.find((view) => view.country === country);
    setSelectedCountry(country);
    setSelectedPlaceId(nextView?.places[0]?.id ?? "");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-bold tracking-tight">Places I Recommend</h2>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          A living map of places I enjoy visiting.
        </p>
      </div>

      {!hasPlaces || !selectedPlace ? (
        <div className="rounded-3xl border bg-background/70 p-8 text-muted-foreground shadow-sm">
          No published places yet.
        </div>
      ) : (
        <>
          {countryViews.length > 0 ? (
            <div
              className="flex flex-wrap gap-2 rounded-2xl border bg-background/60 p-2"
              aria-label="Country views"
            >
              {countryViews.map((view) => {
                const isActive = view.country === activeCountryView?.country;

                return (
                  <button
                    key={view.country}
                    type="button"
                    onClick={() => selectCountry(view.country)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-pressed={isActive}
                  >
                    {view.country}
                    <span
                      className={cn(
                        "ml-2 text-xs",
                        isActive
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {view.places.length}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            className="grid gap-2 rounded-2xl border bg-background/60 p-2 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Place views"
          >
            {countryPlaces.map((place) => {
              const isSelected = place.id === selectedPlace.id;

              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left transition-all duration-200",
                    "hover:border-primary/30 hover:bg-background hover:shadow-sm",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "border-transparent text-muted-foreground"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="truncate text-sm font-semibold">
                    {place.name}
                  </div>
                  <div
                    className={cn(
                      "mt-1 truncate text-xs",
                      isSelected
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    )}
                  >
                    {place.category}
                    {place.locationLabel ? ` - ${place.locationLabel}` : ""}
                  </div>
                </button>
              );
            })}
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
                        {selectedPlace.locationLabel}
                      </p>
                    </div>
                    {selectedPlace.summary ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {selectedPlace.summary}
                      </p>
                    ) : null}
                    {selectedPlace.tip ? (
                      <p className="rounded-2xl border bg-muted/40 p-4 text-sm leading-relaxed">
                        {selectedPlace.tip}
                      </p>
                    ) : null}
                    <a
                      href={selectedPlace.mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/75"
                    >
                      Visit on google map
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
