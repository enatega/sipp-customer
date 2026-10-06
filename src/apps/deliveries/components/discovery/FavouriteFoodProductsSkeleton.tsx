import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../general/components/Skeleton';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

export default function FavouriteFoodProductsSkeleton() {
  const { colors, spacing, shape } = useTheme();
  const { gutter } = useWindowClass();

  return (
    <View style={[styles.list, { paddingHorizontal: gutter, gap: spacing.md }]}>
      {[0, 1, 2].map((key) => (
        <View key={key} style={[styles.row, { backgroundColor: colors.surface, borderRadius: shape.radius.surface, gap: spacing.md, padding: spacing.sm }]}>
          <Skeleton width={88} height={88} borderRadius={shape.radius.control} />
          <View style={[styles.copy, { gap: spacing.sm }]}>
            <Skeleton width="72%" height={18} borderRadius={9} />
            <Skeleton width="48%" height={14} borderRadius={7} />
            <Skeleton width="36%" height={18} borderRadius={9} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 12 },
  row: { alignItems: 'center', flexDirection: 'row' },
  copy: { flex: 1 },
});
