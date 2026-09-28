import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../../../general/components/Skeleton';

export default function TopBrandsListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.card}>
          <Skeleton width={82} height={82} borderRadius={41} />
          <Skeleton width={68} height={12} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    alignItems: 'center',
    gap: 8,
    width: 90,
  },
});
