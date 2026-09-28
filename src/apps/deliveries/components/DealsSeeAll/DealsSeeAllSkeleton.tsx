import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../general/components/Skeleton';

const SKELETON_ITEMS = 4;

type Props = {
  isTabsVisible?: boolean;
};

export default function DealsSeeAllSkeleton({
  isTabsVisible = true,
}: Props) {
  return (
    <View style={styles.container}>
      {isTabsVisible ? (
        <View style={styles.tabsRow}>
          <Skeleton width={45} height={44} borderRadius={22} />
          <Skeleton width={116} height={44} borderRadius={22} />
          <Skeleton width={94} height={44} borderRadius={22} />
        </View>
      ) : null}
      <Skeleton width="52%" height={26} borderRadius={8} />
      <View style={styles.grid}>
        {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
          <View key={index} style={styles.card}>
            <Skeleton width={94} height={94} borderRadius={12} />
            <View style={styles.copy}>
              <Skeleton width="40%" height={14} borderRadius={6} />
              <Skeleton width="85%" height={20} borderRadius={6} />
              <Skeleton width="55%" height={18} borderRadius={6} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 116,
    width: '100%',
  },
  copy: { flex: 1, gap: 10 },
  container: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  grid: {
    gap: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
});
