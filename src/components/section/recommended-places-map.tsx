import type { RecommendedPlace } from "@/types/recommended-place";

interface RecommendedPlacesMapProps {
  readonly place: RecommendedPlace;
}

export default function RecommendedPlacesMap({ place }: RecommendedPlacesMapProps) {
  const query = encodeURIComponent(
    place.coordinates ? place.coordinates.join(",") : place.mapQuery
  );
  const mapSrc = `https://www.google.com/maps?q=${query}&z=15&output=embed`;

  return (
    <iframe
      key={place.id}
      title={`${place.name} on Google Maps`}
      src={mapSrc}
      className="recommended-places-map h-[420px] w-full rounded-3xl border border-border bg-muted shadow-sm md:h-[520px]"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
