import { useQuery } from "@tanstack/react-query";
import type { LatLng } from "react-native-maps";
import type { ApiError } from "../../../general/api/apiClient";
import { addressService } from "../../../general/api/addressService";
import { deliveryKeys } from "../api/queryKeys";

type Coordinate = LatLng | null | undefined;

const MAX_RENDERED_ROUTE_POINTS = 160;

function toRouteKeyValue(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "unknown";
  }

  // A delivery route should not be recomputed for every GPS wobble. A
  // three-decimal bucket is roughly a city block and still refreshes naturally
  // as the courier makes meaningful progress.
  return value.toFixed(3);
}

function reduceRoutePoints(
  points: Array<{ latitude: number; longitude: number }>,
) {
  if (points.length <= MAX_RENDERED_ROUTE_POINTS) return points;

  const lastIndex = points.length - 1;
  const result = Array.from({ length: MAX_RENDERED_ROUTE_POINTS }, (_, index) => {
    const sourceIndex = Math.round(
      (index / (MAX_RENDERED_ROUTE_POINTS - 1)) * lastIndex,
    );
    return points[sourceIndex];
  });

  return result;
}

export function useDeliveryRoutePath(
  origin: Coordinate,
  destination: Coordinate,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
) {
  const isEnabled =
    Boolean(options?.enabled ?? true)
    && Boolean(origin)
    && Boolean(destination);

  return useQuery<Array<{ latitude: number; longitude: number }>, ApiError>({
    queryKey: deliveryKeys.route(
      `origin:${toRouteKeyValue(origin?.latitude)}:${toRouteKeyValue(origin?.longitude)}`,
      `destination:${toRouteKeyValue(destination?.latitude)}:${toRouteKeyValue(destination?.longitude)}`,
    ),
    enabled: isEnabled,
    staleTime: options?.staleTime ?? 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    select: reduceRoutePoints,
    queryFn: () =>
      addressService.getRoutePath(
        {
          lat: origin!.latitude,
          lng: origin!.longitude,
        },
        {
          lat: destination!.latitude,
          lng: destination!.longitude,
        },
      ),
  });
}
