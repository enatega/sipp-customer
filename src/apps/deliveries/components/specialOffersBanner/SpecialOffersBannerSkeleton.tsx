import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../general/components/Skeleton';
import { useTheme } from '../../../../general/theme/theme';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';

type Props = {
  variant?: 'default' | 'home';
};

export default function SpecialOffersBannerSkeleton({ variant = 'default' }: Props) {
  const { layout, shape, spacing } = useTheme();
  const { gutter, width } = useWindowClass();
  const sidePadding = variant === 'home' ? gutter + spacing.sm : gutter;
  const bannerWidth = Math.min(
    width - sidePadding * 2,
    layout.contentMaxWidth.commerce,
  );

  return (
    <View
      style={[
        styles.wrapper,
        { paddingHorizontal: sidePadding, width: bannerWidth + sidePadding * 2 },
      ]}
    >
      <Skeleton
        borderRadius={shape.radius.hero}
        height={variant === 'home' ? 164 : 176}
        width={bannerWidth}
      >
        <View style={[styles.content, { gap: spacing.md, padding: spacing.xl }]}>
          <Skeleton borderRadius={6} height={14} width={140} />
          <Skeleton borderRadius={8} height={28} width="68%" />
          <Skeleton borderRadius={7} height={16} width="82%" />
          <Skeleton borderRadius={7} height={16} width="54%" />
        </View>
      </Skeleton>

      <View
        style={[
          styles.dots,
          { gap: spacing.xs, marginTop: variant === 'home' ? spacing.xs : spacing.sm },
        ]}
      >
        <Skeleton borderRadius={999} height={8} width={24} />
        <Skeleton borderRadius={999} height={8} width={8} />
        <Skeleton borderRadius={999} height={8} width={8} />
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
  },
});
