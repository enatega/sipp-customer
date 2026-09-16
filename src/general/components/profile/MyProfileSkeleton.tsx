import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../Skeleton';

export default function MyProfileSkeleton() {
  return (
    <View style={styles.container}>
      {/* Info card skeleton */}
      <View style={styles.cardWrapper}>
        <Skeleton width="100%" height={332} borderRadius={20} />
      </View>

      {/* Addresses section skeleton */}
      <View style={styles.addressSection}>
        <Skeleton width={120} height={20} borderRadius={4} />
        <Skeleton width="100%" height={78} borderRadius={16} />
        <Skeleton width="100%" height={78} borderRadius={16} />
        <Skeleton width="100%" height={52} borderRadius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addressSection: {
    gap: 12,
    paddingHorizontal: 16,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  container: {
    gap: 24,
    paddingTop: 16,
  },
});
