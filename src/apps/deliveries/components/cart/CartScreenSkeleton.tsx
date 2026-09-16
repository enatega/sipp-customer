import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../../general/components/Skeleton';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

export default function CartScreenSkeleton() {
  const { layout, shape, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingBottom: spacing.sm,
            paddingHorizontal: gutter,
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <Skeleton borderRadius={shape.radius.pill} height={44} width={44} />
        <Skeleton borderRadius={shape.radius.sm} height={26} width={92} />
        <Skeleton borderRadius={shape.radius.pill} height={44} width={44} />
      </View>

      <View
        style={[
          styles.body,
          {
            gap: spacing.section.default,
            maxWidth: layout.contentMaxWidth.readable,
            paddingHorizontal: gutter,
            paddingTop: spacing.sm,
          },
        ]}
      >
        <Skeleton borderRadius={shape.radius.surface} height={82} width="100%" />
        <View style={[styles.section, { gap: spacing.md }]}> 
          <Skeleton borderRadius={shape.radius.sm} height={28} width={126} />
          <Skeleton borderRadius={shape.radius.surface} height={254} width="100%" />
        </View>
        <Skeleton borderRadius={shape.radius.surface} height={214} width="100%" />
        <View style={[styles.section, { gap: spacing.md }]}> 
          <Skeleton borderRadius={shape.radius.sm} height={28} width={190} />
          <View style={[styles.recommendationRow, { gap: spacing.md }]}> 
            <Skeleton borderRadius={shape.radius.surface} height={230} width={196} />
            <Skeleton borderRadius={shape.radius.surface} height={230} width={196} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    alignSelf: 'center',
    width: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationRow: {
    flexDirection: 'row',
  },
  section: {
    width: '100%',
  },
});
