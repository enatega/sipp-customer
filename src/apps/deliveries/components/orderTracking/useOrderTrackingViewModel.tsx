import { useCallback, useMemo, useState } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import type { LatLng, Region } from "react-native-maps";

import type { MapMarker, MapPolyline } from "../../../../general/components/Map";
import { useTheme } from "../../../../general/theme/theme";
import type {
  DeliveryOrderEta,
  DeliveryOrderRider,
  OrderDetailsResponse,
} from "../../api/ordersServiceTypes";
import {
  useDeliveryRoutePath,
  useOrderDetails,
  useOrderRiderLocationSync,
  useOrderStatusSocketSync,
} from "../../hooks";
import type { DeliveriesStackParamList } from "../../navigation/types";

const TRACKING_HOME_MARKER = require("../../../../general/assets/map-markers/tracking-home.png");
const TRACKING_STORE_MARKER = require("../../../../general/assets/map-markers/tracking-store.png");
const TRACKING_RIDER_MARKER = require("../../../../general/assets/map-markers/tracking-rider.png");

export type OrderTrackingViewModel = {
  canContactCourier: boolean;
  chatBoxId: string | null | undefined;
  courierNote: string | null;
  estimatedMinutes: number;
  eta: DeliveryOrderEta | null;
  helpPress: () => void;
  isDelivered: boolean;
  isOrderUnavailable: boolean;
  mapMarkers: MapMarker[];
  mapFitCoordinates: LatLng[];
  mapPolylines: MapPolyline[];
  mapRegion: Region | null;
  onContactCourierPress: () => void;
  onClose: () => void;
  onOpenOrderDetails: () => void;
  onOrderUnavailableAcknowledge: () => void;
  order: OrderDetailsResponse | undefined;
  orderDetailsQuery: ReturnType<typeof useOrderDetails>;
  orderId: string;
  orderUnavailableActionLabel: string;
  orderUnavailableDescription: string;
  orderUnavailableTitle: string;
  restaurantNote: string | null;
  routeState: "fallback" | "loading" | "routed" | "unavailable";
  riderAvatarUri: string | undefined;
  riderId: string | null;
  riderName: string;
  shouldShowNotes: boolean;
};

type Props = {
  navigation: NativeStackNavigationProp<
    DeliveriesStackParamList,
    "OrderTrackingScreen"
  >;
  onMissingReceiver: () => void;
  orderId: string;
};

type TrackingCoordinates = {
  destination: LatLng | null;
  pickup: LatLng | null;
  rider: LatLng | null;
};

type RiderLocation = {
  latitude: number;
  longitude: number;
};

export function useOrderTrackingViewModel({
  navigation,
  onMissingReceiver,
  orderId,
}: Props): OrderTrackingViewModel {
  const { t } = useTranslation("deliveries");
  const { colors } = useTheme();

  useOrderStatusSocketSync(orderId);

  const orderDetailsQuery = useOrderDetails(orderId);
  const order = orderDetailsQuery.data;

  const riderId = resolveRiderId(order?.rider);
  const riderName =
    order?.rider?.name ||
    t("order_tracking_courier_fallback");
  const riderAvatarUri =
    typeof order?.rider?.profile === "string"
      ? order.rider.profile
      : typeof order?.rider?.image === "string"
        ? order.rider.image
        : undefined;
  const chatBoxId = order?.chatBoxId;
  const riderLocation = useOrderRiderLocationSync(
    order?.orderType === "delivery" ? (order?.rider?.userId ?? null) : null,
    getOrderRiderLocation(order?.rider),
    { enabled: order?.orderType === "delivery" },
  );
  const eta = riderLocation?.eta ?? order?.eta ?? null;
  const estimatedMinutes = eta?.estimatedMinutes
    ?? (Number(order?.store.estimatedDeliveryTime) || 0);
  const isPostPickupTracking = isPostPickupTrackingStatus(order?.status);

  const mapCoordinates = useMemo(
    () =>
      getTrackingCoordinates(
        order?.orderType,
        order?.deliveryDetails.latitude ?? null,
        order?.deliveryDetails.longitude ?? null,
        order?.deliveryDetails.storeLatitude ?? null,
        order?.deliveryDetails.storeLongitude ?? null,
        riderLocation,
      ),
    [
      order?.deliveryDetails.latitude,
      order?.deliveryDetails.longitude,
      order?.deliveryDetails.storeLatitude,
      order?.deliveryDetails.storeLongitude,
      order?.orderType,
      riderLocation,
    ],
  );

  const mapMarkers = useMemo<MapMarker[]>(
    () => getTrackingMapMarkers(order?.orderType, mapCoordinates, isPostPickupTracking),
    [isPostPickupTracking, mapCoordinates, order?.orderType],
  );

  const routeOrigin = order?.orderType === "delivery"
    ? isPostPickupTracking
      ? mapCoordinates.rider
      : mapCoordinates.pickup
    : mapCoordinates.pickup;
  const routeDestination = mapCoordinates.destination;

  const routePathQuery = useDeliveryRoutePath(routeOrigin, routeDestination, {
    enabled: Boolean(routeOrigin && routeDestination),
    staleTime: order?.orderType === "delivery" ? 2 * 60 * 1000 : 10 * 60 * 1000,
  });

  const mapFitCoordinates = useMemo(
    () => getTrackingFitCoordinates(mapCoordinates, routePathQuery.data, isPostPickupTracking),
    [isPostPickupTracking, mapCoordinates, routePathQuery.data],
  );
  const mapRegion = useMemo(
    () => getTrackingMapRegion(mapFitCoordinates),
    [mapFitCoordinates],
  );

  const mapPolylines = useMemo<MapPolyline[]>(
    () =>
      getTrackingMapPolylines(
        order?.orderType,
        mapCoordinates,
        routePathQuery.data,
        colors.primary,
        isPostPickupTracking,
      ),
    [colors.primary, isPostPickupTracking, mapCoordinates, order?.orderType, routePathQuery.data],
  );
  const hasRouteEndpoints = Boolean(routeOrigin && routeDestination);
  const hasRoutedPath = (routePathQuery.data?.length ?? 0) >= 2;
  const routeState: OrderTrackingViewModel["routeState"] = !hasRouteEndpoints
    ? "unavailable"
    : hasRoutedPath
      ? "routed"
      : routePathQuery.isFetching
        ? "loading"
        : "fallback";

  const isDelivered = order?.status === "delivered";
  const isOrderUnavailable =
    order?.status === "rejected"
    || order?.status === "cancelled"
    || order?.status === "failed";
  const [hasAcknowledgedUnavailable, setHasAcknowledgedUnavailable] = useState(false);

  const goToDeliveriesHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: getTrackingRootRoute(navigation) }],
    } as never);
  }, [navigation]);

  const onOrderUnavailableAcknowledge = useCallback(() => {
    setHasAcknowledgedUnavailable(true);
    goToDeliveriesHome();
  }, [goToDeliveriesHome]);
  const canContactCourier = [
    "rider_assigned",
    "picked_up",
    "out_for_delivery",
    "arrived",
  ].includes(order?.status ?? "") && Boolean(riderId || chatBoxId);
  const restaurantNote = order?.restaurantNote?.trim() || null;
  const courierNote = order?.courierNote?.trim() || null;
  const shouldShowNotes = Boolean(restaurantNote || courierNote);

  return {
    canContactCourier,
    chatBoxId,
    courierNote,
    estimatedMinutes,
    eta,
    helpPress: () => navigation.navigate("Support"),
    isDelivered,
    isOrderUnavailable: isOrderUnavailable && !hasAcknowledgedUnavailable,
    mapMarkers,
    mapFitCoordinates,
    mapPolylines,
    mapRegion,
    onContactCourierPress: () => {
      if (!riderId && !chatBoxId) {
        onMissingReceiver();
        return;
      }

      navigation.navigate("RiderChat", {
        chatBoxId: chatBoxId ?? undefined,
        estimatedMinutes,
        orderCode: order?.summary.orderNumber || orderId,
        receiverId: riderId ?? undefined,
        riderAvatarUri,
        riderName,
      });
    },
    onClose: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      goToDeliveriesHome();
    },
    onOpenOrderDetails: () => navigation.navigate("OrderDetailsScreen", { orderId }),
    onOrderUnavailableAcknowledge,
    order,
    orderDetailsQuery,
    orderId,
    orderUnavailableActionLabel: t("order_tracking_unavailable_action"),
    orderUnavailableDescription:
      order?.status === "cancelled"
        ? t("order_tracking_unavailable_cancelled_description")
        : t("order_tracking_unavailable_description"),
    orderUnavailableTitle: t("order_tracking_unavailable_title"),
    restaurantNote,
    routeState,
    riderAvatarUri,
    riderId,
    riderName,
    shouldShowNotes,
  };
}

const DELIVERY_ROOT_ROUTES = ["SingleVendor", "MultiVendor", "Chain"] as const;

function getTrackingRootRoute(
  navigation: NativeStackNavigationProp<
    DeliveriesStackParamList,
    "OrderTrackingScreen"
  >,
): (typeof DELIVERY_ROOT_ROUTES)[number] {
  const routes = navigation.getState().routes;

  for (let index = routes.length - 1; index >= 0; index -= 1) {
    const routeName = routes[index]?.name;
    if (DELIVERY_ROOT_ROUTES.includes(routeName as (typeof DELIVERY_ROOT_ROUTES)[number])) {
      return routeName as (typeof DELIVERY_ROOT_ROUTES)[number];
    }
  }

  return "MultiVendor";
}

function resolveRiderId(rider: DeliveryOrderRider | null | undefined): string | null {
  if (!rider) {
    return null;
  }

  const directCandidates = [rider.userId, rider.id] as const;
  for (const candidate of directCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  const objectCandidate = rider as { _id?: unknown; user?: { id?: unknown; _id?: unknown } };
  const nestedCandidates = [
    objectCandidate._id,
    objectCandidate.user?.id,
    objectCandidate.user?._id,
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return null;
}

function getTrackingCoordinates(
  orderType: string | null | undefined,
  deliveryLatitude: number | null,
  deliveryLongitude: number | null,
  storeLatitude: number | null,
  storeLongitude: number | null,
  riderLocation: RiderLocation | null,
): TrackingCoordinates {
  return {
    destination:
      typeof deliveryLatitude === "number" && typeof deliveryLongitude === "number"
        ? {
            latitude: deliveryLatitude,
            longitude: deliveryLongitude,
          }
        : null,
    pickup:
      typeof storeLatitude === "number" && typeof storeLongitude === "number"
        ? {
            latitude: storeLatitude,
            longitude: storeLongitude,
          }
        : null,
    rider:
      orderType === "delivery" && riderLocation
        ? {
            latitude: riderLocation.latitude,
            longitude: riderLocation.longitude,
          }
        : null,
  };
}

function getTrackingMapRegion(points: LatLng[]): Region | null {
  if (points.length === 0) {
    return null;
  }

  if (points.length === 1) {
    return {
      latitude: points[0].latitude,
      longitude: points[0].longitude,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta: Math.max(maxLatitude - minLatitude, 0.0025) * 1.35,
    longitudeDelta: Math.max(maxLongitude - minLongitude, 0.0025) * 1.35,
  };
}

function getTrackingFitCoordinates(
  coordinates: TrackingCoordinates,
  routePath: LatLng[] | undefined,
  isPostPickupTracking: boolean,
): LatLng[] {
  const visibleEndpoints = [
    isPostPickupTracking ? coordinates.rider : coordinates.pickup,
    coordinates.destination,
  ].filter(Boolean) as LatLng[];
  const hasActiveOrigin = isPostPickupTracking
    ? Boolean(coordinates.rider)
    : Boolean(coordinates.pickup);
  const candidates = hasActiveOrigin && (routePath?.length ?? 0) >= 2
    ? [...routePath!, ...visibleEndpoints]
    : visibleEndpoints;
  const seen = new Set<string>();

  return candidates.filter((point) => {
    const key = `${point.latitude.toFixed(6)}:${point.longitude.toFixed(6)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getTrackingMapMarkers(
  orderType: string | null | undefined,
  coordinates: TrackingCoordinates,
  isPostPickupTracking: boolean,
): MapMarker[] {
  const markers: MapMarker[] = [];
  const shouldShowPickupMarker = orderType === "pickup" || !isPostPickupTracking;

  if (shouldShowPickupMarker && coordinates.pickup) {
    markers.push({
      coordinate: coordinates.pickup,
      id: "pickup",
      anchor: { x: 0.5, y: 0.5 },
      centerOffset: { x: 0, y: 0 },
      image: TRACKING_STORE_MARKER,
      tappable: false,
      zIndex: 1,
      tracksViewChanges: false,
    });
  }

  if (coordinates.destination) {
    markers.push({
      coordinate: coordinates.destination,
      id: "destination",
      anchor: { x: 0.5, y: 0.5 },
      centerOffset: { x: 0, y: 0 },
      image: TRACKING_HOME_MARKER,
      tappable: false,
      zIndex: 3,
      tracksViewChanges: false,
    });
  }

  if (isPostPickupTracking && coordinates.rider) {
    markers.push({
      coordinate: coordinates.rider,
      id: "rider",
      anchor: { x: 0.5, y: 0.5 },
      centerOffset: { x: 0, y: 0 },
      image: TRACKING_RIDER_MARKER,
      tappable: false,
      zIndex: 2,
      tracksViewChanges: false,
    });
  }

  return markers;
}

function getTrackingMapPolylines(
  orderType: string | null | undefined,
  coordinates: TrackingCoordinates,
  routePath: Array<{ latitude: number; longitude: number }> | undefined,
  strokeColor: string,
  isPostPickupTracking: boolean,
): MapPolyline[] {
  const hasRoutedPath = (routePath?.length ?? 0) >= 2;
  if (!hasRoutedPath) return [];

  if (orderType === "delivery" && isPostPickupTracking && coordinates.rider && coordinates.destination) {
    return [
      {
        coordinates: routePath!,
        id: "delivery-route",
        strokeColor,
        strokeWidth: 5,
      },
    ];
  }

  if (
    (orderType !== "delivery" || !isPostPickupTracking)
    && coordinates.pickup
    && coordinates.destination
  ) {
    return [
      {
        coordinates: routePath!,
        id: "pickup-route",
        strokeColor,
        strokeWidth: 5,
      },
    ];
  }

  return [];
}

function isPostPickupTrackingStatus(status: string | null | undefined) {
  return ["picked_up", "out_for_delivery", "arrived", "delivered"].includes(
    status?.toLowerCase?.() ?? "",
  );
}

function getOrderRiderLocation(rider: DeliveryOrderRider | null | undefined) {
  const latitude = rider?.currentLocation?.latitude ?? rider?.latitude ?? null;
  const longitude = rider?.currentLocation?.longitude ?? rider?.longitude ?? null;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}
