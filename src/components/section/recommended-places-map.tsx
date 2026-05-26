"use client";

import type { RecommendedPlace } from "@/data/recommended-places";
import type { LatLngBoundsExpression } from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

interface RecommendedPlacesMapProps {
  readonly places: readonly RecommendedPlace[];
  readonly selectedPlaceId: string;
  readonly onSelectPlace: (placeId: string) => void;
}

function MapCamera({
  places,
  selectedPlaceId,
}: Pick<RecommendedPlacesMapProps, "places" | "selectedPlaceId">) {
  const map = useMap();
  const didFitInitialBounds = useRef(false);

  const bounds = useMemo<LatLngBoundsExpression>(
    () => places.map((place) => place.coordinates),
    [places]
  );

  useEffect(() => {
    if (places.length === 0 || didFitInitialBounds.current) {
      return;
    }

    map.fitBounds(bounds, {
      padding: [34, 34],
      maxZoom: 13,
    });
    didFitInitialBounds.current = true;
  }, [bounds, map, places.length]);

  useEffect(() => {
    if (!didFitInitialBounds.current) {
      return;
    }

    const selectedPlace = places.find((place) => place.id === selectedPlaceId);

    if (!selectedPlace) {
      return;
    }

    map.flyTo(selectedPlace.coordinates, 14, {
      animate: true,
      duration: 0.7,
    });
  }, [map, places, selectedPlaceId]);

  return null;
}

export default function RecommendedPlacesMap({
  places,
  selectedPlaceId,
  onSelectPlace,
}: RecommendedPlacesMapProps) {
  const center = places[0]?.coordinates ?? [-37.8136, 144.9631];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="recommended-places-map h-[420px] w-full rounded-3xl border border-border bg-muted shadow-sm md:h-[520px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCamera places={places} selectedPlaceId={selectedPlaceId} />
      {places.map((place) => {
        const isSelected = place.id === selectedPlaceId;

        return (
          <CircleMarker
            key={place.id}
            center={place.coordinates}
            radius={isSelected ? 13 : 9}
            pathOptions={{
              color: isSelected ? "hsl(0 0% 9%)" : "hsl(0 0% 45%)",
              fillColor: isSelected ? "hsl(0 0% 9%)" : "hsl(0 0% 100%)",
              fillOpacity: isSelected ? 0.95 : 0.85,
              opacity: 1,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{
              click: () => onSelectPlace(place.id),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="text-sm font-semibold">{place.name}</div>
                <div className="text-xs text-slate-600">{place.summary}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
