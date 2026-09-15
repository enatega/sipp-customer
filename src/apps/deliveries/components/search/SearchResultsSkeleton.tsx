import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Skeleton from "../../../../general/components/Skeleton";
import type { SearchResultsSkeletonProps } from "./types";
import { useTheme } from "../../../../general/theme/theme";

export default function SearchResultsSkeleton({
  showStores = true,
}: SearchResultsSkeletonProps) {
  const { shape, spacing } = useTheme();

  return (
    <View style={[styles.container, { gap: spacing.section.default }]}>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Skeleton width={110} height={24} borderRadius={shape.radius.xs} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.productRow, { gap: spacing.md }]}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={`product-skeleton-${index}`}
              style={styles.productCard}
            >
              <Skeleton width={100} height={100} borderRadius={shape.radius.control} />
              <Skeleton width={82} height={14} borderRadius={shape.radius.xs} />
              <Skeleton width={58} height={12} borderRadius={shape.radius.xs} />
            </View>
          ))}
        </ScrollView>
      </View>

      {showStores ? (
        <View style={styles.section}>
          <View style={styles.storeHeader}>
            <Skeleton width={88} height={24} borderRadius={shape.radius.xs} />
          </View>

          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={`store-skeleton-${index}`}
              style={[
                styles.storeCard,
                { borderRadius: shape.radius.surface },
              ]}
            >
              <Skeleton width={116} height={132} borderRadius={0} />
              <View
                style={[
                  styles.storeContent,
                  { gap: spacing.sm, padding: spacing.md },
                ]}
              >
                <Skeleton width="55%" height={18} borderRadius={shape.radius.xs} />
                <View style={styles.metaRow}>
                  <Skeleton width={76} height={12} borderRadius={4} />
                  <Skeleton width={60} height={12} borderRadius={4} />
                </View>
                <Skeleton width="100%" height={1} borderRadius={1} />
                <View style={styles.infoRow}>
                  <Skeleton width={52} height={12} borderRadius={4} />
                  <Skeleton width={64} height={12} borderRadius={4} />
                  <Skeleton width={54} height={12} borderRadius={4} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  section: {},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  storeHeader: {
    marginBottom: 12,
  },
  productRow: {
    paddingRight: 8,
  },
  productCard: {
    width: 116,
    gap: 8,
  },
  storeCard: {
    alignItems: 'stretch',
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 132,
    overflow: 'hidden',
  },
  storeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
