import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../general/components/Skeleton';
import { useTheme } from '../../../../general/theme/theme';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';

type Props = {
  variant?: 'default' | 'home';
};

export default function SpecialOffersBannerSkeleton({ variant = 'default' }: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { gutter, width } = useWindowClass();
  const sidePadding = variant === 'home' ? gutter + spacing.sm : gutter;
  const bannerWidth = Math.min(
    width - sidePadding * 2,
    layout.contentMaxWidth.commerce,
  );
  const bannerHeight = variant === 'home' ? Math.max(120, bannerWidth / 3) : 176;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingHorizontal: sidePadding, width: bannerWidth + sidePadding * 2 },
      ]}
    >
      <Skeleton
        borderRadius={shape.radius.hero}
        height={bannerHeight}
        width={bannerWidth}
      >
        <View style={[styles.content, { gap: variant === 'home' ? spacing.sm : spacing.md, padding: variant === 'home' ? spacing.md : spacing.xl }]}>
          <Skeleton borderRadius={6} height={14} width={140} />
          <Skeleton borderRadius={8} height={28} width="68%" />
          <Skeleton borderRadius={7} height={16} width="82%" />
          {variant === 'home' ? null : <Skeleton borderRadius={7} height={16} width="54%" />}
        </View>
      </Skeleton>

      <View
        pointerEvents="none"
        style={[
          styles.dots,
          { bottom: spacing.sm, left: sidePadding, right: sidePadding },
        ]}
      >
        <View style={[styles.dotTrack, { backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.pill, gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }]}>
          <Skeleton borderRadius={shape.radius.pill} height={6} width={19} />
          <Skeleton borderRadius={shape.radius.pill} height={6} width={6} />
          <Skeleton borderRadius={shape.radius.pill} height={6} width={6} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  content: {
    justifyContent: 'flex-end',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
  },
  dotTrack: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
