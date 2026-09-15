import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../../../general/components/Skeleton';

export default function TopBrandsListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.card}>
          <Skeleton
            width={styles.imageWrap.width}
            height={styles.imageWrap.height}
            borderRadius={styles.imageWrap.borderRadius}
          >
            <View style={styles.imageContainer}>
              <Skeleton width={84} height={84} borderRadius={12} />
            </View>
          </Skeleton>

          <View style={styles.content}>
            <Skeleton width={64} height={14} borderRadius={7} />
            <Skeleton width={52} height={14} borderRadius={7} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    borderRadius: 16,
    gap: 0,
    height: 168,
    overflow: 'hidden',
    width: 112,
  },
  imageWrap: {
    borderRadius: 16,
    height: 112,
    width: 112,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 4,
    padding: 8,
  },
});
