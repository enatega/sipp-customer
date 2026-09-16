import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import type MapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import Map from "../../../../general/components/Map";
import PlatformGlassSurface from "../../../../general/components/PlatformGlassSurface";
import PressableScale from "../../../../general/components/PressableScale";
import ScreenHeader from "../../../../general/components/ScreenHeader";
import SwipeableBottomSheet from "../../../../general/components/SwipeableBottomSheet";
import Text from "../../../../general/components/Text";
import { useTheme } from "../../../../general/theme/theme";
import OrderTrackingErrorState from "./OrderTrackingErrorState";
import OrderTrackingLoadingSkeleton from "./OrderTrackingLoadingSkeleton";
import OrderTrackingModernEtaFrame from "./OrderTrackingModernEtaFrame";
import OrderTrackingModernProgressCard from "./OrderTrackingModernProgressCard";
import OrderTrackingModernSections from "./OrderTrackingModernSections";
import type { OrderTrackingViewModel } from "./useOrderTrackingViewModel";
import { formatEstimatedArrivalWindow } from "../../utils/orderTracking/orderTrackingUtils";

type Props = { viewModel: OrderTrackingViewModel };

export default function OrderTrackingModernView({ viewModel }: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, shape } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { order, orderDetailsQuery } = viewModel;
  const [isOrderItemsExpanded, setIsOrderItemsExpanded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [sheetState, setSheetState] = useState<"collapsed" | "default" | "expanded">("expanded");
  const mapRef = useRef<MapView>(null);
  const sheetExpandedHeight = Math.min(
    windowHeight - insets.top - 92,
    Math.max(500, windowHeight * 0.7),
  );
  const sheetCollapsedHeight = Math.min(204, sheetExpandedHeight);
  const visibleSheetHeight = sheetState === "expanded"
    ? sheetExpandedHeight
    : sheetCollapsedHeight;
  const mapFitCoordinatesRef = useRef(viewModel.mapFitCoordinates);
  mapFitCoordinatesRef.current = viewModel.mapFitCoordinates;
  const fitCoordinatesSignature = useMemo(
    () => viewModel.mapFitCoordinates
      .map(({ latitude, longitude }) => `${latitude.toFixed(6)}:${longitude.toFixed(6)}`)
      .join("|"),
    [viewModel.mapFitCoordinates],
  );

  const fitRouteToMap = useCallback((animated = true) => {
    const map = mapRef.current;
    const coordinates = mapFitCoordinatesRef.current;
    if (!map || coordinates.length === 0) return;

    if (coordinates.length === 1) {
      map.animateToRegion({
        ...coordinates[0],
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }, animated ? 260 : 0);
      return;
    }

    const minimumVisibleMapHeight = 150;
    const maximumBottomPadding = Math.max(
      100,
      windowHeight - insets.top - minimumVisibleMapHeight,
    );
    map.fitToCoordinates(coordinates, {
      animated,
      edgePadding: {
        top: insets.top + 82,
        right: 46,
        bottom: Math.min(visibleSheetHeight + 24, maximumBottomPadding),
        left: 46,
      },
    });
  }, [insets.top, visibleSheetHeight, windowHeight]);

  useEffect(() => {
    if (!isMapReady || !fitCoordinatesSignature) return;
    const frame = requestAnimationFrame(() => fitRouteToMap(true));
    return () => cancelAnimationFrame(frame);
  }, [fitCoordinatesSignature, fitRouteToMap, isMapReady]);

  const progressTimeLabel = useMemo(() => {
    const item = order?.timeline?.find((entry) => entry.active || entry.completed);
    if (!item?.completedAt) return "—";
    return new Date(item.completedAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [order?.timeline]);

  if (orderDetailsQuery.isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}> 
        <OrderTrackingLoadingSkeleton />
      </View>
    );
  }

  if (orderDetailsQuery.isError || !order) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}> 
        <ScreenHeader title={t("order_tracking_title")} variant="close" />
        <OrderTrackingErrorState
          isRetrying={orderDetailsQuery.isFetching}
          onRetry={() => void orderDetailsQuery.refetch()}
        />
      </View>
    );
  }

  const dynamicEtaMinutes = viewModel.eta?.estimatedMinutes;
  const safeDynamicEtaMinutes = typeof dynamicEtaMinutes === "number"
    && Number.isFinite(dynamicEtaMinutes)
    && dynamicEtaMinutes > 0
      ? Math.ceil(dynamicEtaMinutes)
      : null;
  const hasLiveEta = safeDynamicEtaMinutes !== null;
  const arrivalWindow = formatEstimatedArrivalWindow(viewModel.eta);
  const etaLabel = viewModel.isDelivered
    ? t("order_tracking_delivered_title")
    : hasLiveEta
      ? `${safeDynamicEtaMinutes} min`
      : t("order_tracking_eta_pending");
  const arrivalWindowLabel = arrivalWindow
    ? t("order_tracking_estimated_arrival", { time: arrivalWindow })
    : null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <View style={[styles.mapStage, { backgroundColor: colors.surfaceSunken }]}> 
        {viewModel.mapRegion ? (
          <Map
            ref={mapRef}
            initialRegion={viewModel.mapRegion}
            loadingEnabled
            markers={viewModel.mapMarkers}
            moveOnMarkerPress={false}
            onMapReady={() => setIsMapReady(true)}
            pitchEnabled={false}
            polylines={viewModel.mapPolylines}
            rotateEnabled={false}
            scrollEnabled
            showsBuildings={false}
            showsCompass={false}
            showsIndoorLevelPicker={false}
            showsPointsOfInterest={false}
            style={styles.map}
            toolbarEnabled={false}
            useGoogleProvider
            zoomEnabled
            zoomTapEnabled
          />
        ) : (
          <View style={styles.mapUnavailable}>
            <View style={[styles.mapUnavailableIcon, { backgroundColor: colors.surfaceElevated }]}> 
              <Ionicons color={colors.primary} name="map-outline" size={28} />
            </View>
            <Text color={colors.text} style={styles.mapUnavailableTitle} weight="bold">
              {t("order_tracking_location_unavailable")}
            </Text>
            <Text color={colors.mutedText} style={styles.mapUnavailableCopy}>
              {t("order_tracking_location_unavailable_description")}
            </Text>
          </View>
        )}

        <View pointerEvents="box-none" style={[styles.topControls, { paddingTop: insets.top + 12 }]}> 
          <GlassMapButton
            accessibilityLabel={t("order_tracking_close")}
            icon="close"
            onPress={viewModel.onClose}
          />
          <GlassMapButton
            accessibilityLabel={t("order_tracking_help")}
            icon="help-circle-outline"
            onPress={viewModel.helpPress}
          />
        </View>

        {viewModel.mapRegion ? (
          <View pointerEvents="box-none" style={[styles.recenterWrap, { bottom: visibleSheetHeight + 16 }]}> 
            <GlassMapButton
              accessibilityLabel={t("order_tracking_recenter_map")}
              icon="locate-outline"
              onPress={() => fitRouteToMap(true)}
              size="small"
            />
          </View>
        ) : null}

        {viewModel.mapRegion && viewModel.routeState !== "routed" ? (
          <View
            style={[
              styles.routeNotice,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                top: insets.top + 82,
              },
            ]}
          >
            <Ionicons
              color={viewModel.routeState === "fallback" || viewModel.routeState === "unavailable" ? colors.warning : colors.primary}
              name={viewModel.routeState === "loading" ? "navigate-outline" : "alert-circle-outline"}
              size={17}
            />
            <View style={styles.routeNoticeCopy}>
              <Text color={colors.text} numberOfLines={1} style={styles.routeNoticeTitle} weight="semiBold">
                {t(
                  viewModel.routeState === "fallback"
                    ? "order_tracking_route_unavailable"
                    : viewModel.routeState === "unavailable"
                      ? "order_tracking_route_pending"
                      : "order_tracking_route_loading",
                )}
              </Text>
              {viewModel.routeState === "fallback" || viewModel.routeState === "unavailable" ? (
                <Text color={colors.textSubtle} numberOfLines={1} style={styles.routeNoticeSubtitle}>
                  {t(
                    viewModel.routeState === "fallback"
                      ? "order_tracking_route_unavailable_description"
                      : "order_tracking_route_pending_description",
                  )}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      <SwipeableBottomSheet
        collapsedHeight={sheetCollapsedHeight}
        expandedHeight={sheetExpandedHeight}
        handle={
          <View style={styles.sheetHandleContent}>
            <View style={[styles.grabber, { backgroundColor: colors.border }]} />
            <OrderTrackingModernEtaFrame
              arrivalWindowLabel={arrivalWindowLabel}
              etaLabel={etaLabel}
              hasLiveEta={hasLiveEta}
              showDeliveredTitle={viewModel.isDelivered}
              status={order.status}
              statusMessage={order.statusMessage}
              statusTitle={order.statusTitle}
            />
          </View>
        }
        handleContainerStyle={styles.sheetHandleContainer}
        handleGestureInset={8}
        initialState="expanded"
        onStateChange={setSheetState}
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderTopLeftRadius: shape.radius.sheet,
            borderTopRightRadius: shape.radius.sheet,
            shadowColor: colors.shadowColor,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[styles.sheetContent, { paddingBottom: Math.max(insets.bottom, 20) + 24 }]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={styles.sheetScroll}
        >
          <OrderTrackingModernProgressCard
            progressTimeLabel={progressTimeLabel}
            status={order.status}
          />
          <OrderTrackingModernSections
            isOrderItemsExpanded={isOrderItemsExpanded}
            onToggleItems={() => setIsOrderItemsExpanded((previous) => !previous)}
            order={order}
            viewModel={viewModel}
          />
        </ScrollView>
      </SwipeableBottomSheet>
    </View>
  );
}

type GlassMapButtonProps = {
  accessibilityLabel: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  size?: "default" | "small";
};

function GlassMapButton({ accessibilityLabel, icon, onPress, size = "default" }: GlassMapButtonProps) {
  const { colors } = useTheme();
  const dimension = size === "small" ? 46 : 52;

  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={{ borderRadius: dimension / 2 }}
    >
      <PlatformGlassSurface
        effectStyle="clear"
        style={[
          styles.glassButton,
          {
            borderColor: colors.glassBorder,
            borderRadius: dimension / 2,
            height: dimension,
            width: dimension,
          },
        ]}
      >
        <Ionicons color={colors.text} name={icon} size={size === "small" ? 21 : 24} />
      </PlatformGlassSurface>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  glassButton: { alignItems: "center", borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", overflow: "hidden" },
  grabber: { alignSelf: "center", borderRadius: 999, height: 5, marginBottom: 12, width: 42 },
  map: { ...StyleSheet.absoluteFillObject },
  mapStage: { ...StyleSheet.absoluteFillObject },
  mapUnavailable: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", paddingBottom: 190, paddingHorizontal: 40 },
  mapUnavailableCopy: { fontSize: 13, lineHeight: 19, marginTop: 4, maxWidth: 280, textAlign: "center" },
  mapUnavailableIcon: { alignItems: "center", borderRadius: 24, height: 56, justifyContent: "center", marginBottom: 12, width: 56 },
  mapUnavailableTitle: { fontSize: 18, lineHeight: 24 },
  recenterWrap: { position: "absolute", right: 16, zIndex: 4 },
  routeNotice: { alignItems: "center", alignSelf: "center", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 9, maxWidth: "78%", paddingHorizontal: 12, paddingVertical: 9, position: "absolute", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, zIndex: 3 },
  routeNoticeCopy: { flexShrink: 1 },
  routeNoticeSubtitle: { fontSize: 10, lineHeight: 14, marginTop: 1 },
  routeNoticeTitle: { fontSize: 12, lineHeight: 16 },
  screen: { flex: 1 },
  sheet: { borderTopWidth: StyleSheet.hairlineWidth, elevation: 12, overflow: "hidden", shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 22, zIndex: 5 },
  sheetContent: { paddingHorizontal: 20 },
  sheetHandleContainer: { alignSelf: "stretch" },
  sheetHandleContent: { paddingHorizontal: 20, paddingTop: 10 },
  sheetScroll: { flex: 1 },
  topControls: { flexDirection: "row", justifyContent: "space-between", left: 16, position: "absolute", right: 16, zIndex: 4 },
});
