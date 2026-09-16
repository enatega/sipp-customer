import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Skeleton from "../../../../general/components/Skeleton";
import { useTheme } from "../../../../general/theme/theme";

export default function OrderTrackingLoadingSkeleton() {
  const { colors, shape } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSunken }]}> 
      <View style={[styles.mapWash, { backgroundColor: colors.backgroundTertiary }]} />
      <View style={[styles.topControls, { top: insets.top + 12 }]}> 
        <Skeleton borderRadius={26} height={52} width={52} />
        <Skeleton borderRadius={26} height={52} width={52} />
      </View>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderTopLeftRadius: shape.radius.sheet,
            borderTopRightRadius: shape.radius.sheet,
          },
        ]}
      >
        <Skeleton borderRadius={3} height={5} style={styles.grabber} width={42} />
        <View style={styles.etaRow}>
          <Skeleton borderRadius={46} height={92} width={92} />
          <View style={styles.etaCopy}>
            <Skeleton height={14} width="34%" />
            <Skeleton height={25} style={styles.copyGap} width="66%" />
            <Skeleton height={14} style={styles.copyGapSmall} width="86%" />
          </View>
        </View>
        <Skeleton height={24} style={styles.sectionGap} width="45%" />
        <Skeleton height={16} style={styles.copyGap} width="64%" />
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map((item) => (
            <Skeleton borderRadius={3} height={6} key={item} style={styles.progressSegment} />
          ))}
        </View>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.timelineRow}>
            <Skeleton borderRadius={20} height={40} width={40} />
            <Skeleton height={17} width={index === 1 ? "48%" : "58%"} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  copyGap: { marginTop: 8 },
  copyGapSmall: { marginTop: 6 },
  etaCopy: { flex: 1 },
  etaRow: { alignItems: "center", flexDirection: "row", gap: 16 },
  grabber: { alignSelf: "center", marginBottom: 14 },
  mapWash: { ...StyleSheet.absoluteFillObject },
  progressRow: { flexDirection: "row", gap: 6, marginTop: 15 },
  progressSegment: { flex: 1 },
  sectionGap: { marginTop: 24 },
  sheet: { bottom: 0, height: "70%", left: 0, paddingHorizontal: 20, paddingTop: 12, position: "absolute", right: 0 },
  timelineRow: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 20 },
  topControls: { flexDirection: "row", justifyContent: "space-between", left: 16, position: "absolute", right: 16 },
});
