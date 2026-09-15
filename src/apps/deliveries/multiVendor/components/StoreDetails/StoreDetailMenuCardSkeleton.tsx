import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../../general/components/Skeleton';
import { useTheme } from '../../../../../general/theme/theme';

export default function StoreDetailMenuCardSkeleton() {
  const { colors, elevation, shape, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        elevation.raised,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: shape.radius.surface,
          gap: spacing.md,
          padding: spacing.md,
        },
      ]}
    >
      <Skeleton height={112} width={112} borderRadius={shape.radius.control} />
      <View style={[styles.content, { gap: spacing.sm }]}>
        <Skeleton height={20} width="78%" borderRadius={shape.radius.xs} />
        <Skeleton height={15} width="94%" borderRadius={shape.radius.xs} />
        <Skeleton height={15} width="64%" borderRadius={shape.radius.xs} />
        <View style={styles.footer}>
          <Skeleton height={22} width="38%" borderRadius={shape.radius.xs} />
          <Skeleton height={44} width={44} borderRadius={shape.radius.pill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    width: '100%',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
});
