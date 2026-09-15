import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../../general/components/Icon';
import Image from '../../../../../general/components/Image';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import { useStoreDetailTabsScroll } from '../../hooks/useStoreDetailPager';

type Props = {
  activeCategoryId: string | null;
  categories: DeliveryStoreDetailsFilterItem[];
  onSelect: (categoryId: string | null) => void;
};

type TabItemProps = {
  id: string | null;
  imageUrl: string | null;
  isActive: boolean;
  label: string;
  onLayout: React.ComponentProps<typeof PressableScale>['onLayout'];
  onPress: () => void;
};

function StoreDetailTabItem({
  id,
  imageUrl,
  isActive,
  label,
  onLayout,
  onPress,
}: TabItemProps) {
  const { colors, layout, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const activeProgress = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    activeProgress.value = isReducedMotionEnabled
      ? isActive ? 1 : 0
      : withSpring(isActive ? 1 : 0, motion.spring.responsive);
  }, [activeProgress, isActive, isReducedMotionEnabled, motion.spring.responsive]);

  const animatedSurfaceStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      [colors.surfaceElevated, colors.primary],
    ),
    borderColor: interpolateColor(
      activeProgress.value,
      [0, 1],
      [colors.divider, colors.primary],
    ),
    transform: [{ scale: 1 + activeProgress.value * 0.015 }],
  }));

  return (
    <PressableScale
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      key={id ?? 'offers'}
      onLayout={onLayout}
      onPress={onPress}
      style={[
        styles.tab,
        {
          borderRadius: shape.radius.pill,
          minHeight: layout.touchTarget.minimum,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.tabSurface,
          animatedSurfaceStyle,
          {
            borderRadius: shape.radius.pill,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            accessible={false}
            resizeMode="cover"
            source={{ uri: imageUrl }}
            style={[
              styles.image,
              {
                backgroundColor: colors.surfaceSunken,
                borderRadius: shape.radius.pill,
              },
            ]}
          />
        ) : id === null ? (
          <View style={styles.icon}>
            <Icon
              color={isActive ? colors.onPrimary : colors.primary}
              name="pricetag-outline"
              size={17}
              type="Ionicons"
            />
          </View>
        ) : null}
        <Text
          color={isActive ? colors.onPrimary : colors.textSubtle}
          variant="label"
          weight={isActive ? 'bold' : 'semiBold'}
        >
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

export default function StoreDetailTabs({ activeCategoryId, categories, onSelect }: Props) {
  const { spacing } = useTheme();
  const { gutter, width } = useWindowClass();
  const { t } = useTranslation('deliveries');
  const { registerTabLayout, scrollViewRef } = useStoreDetailTabsScroll({
    activeCategoryId,
    screenWidth: width,
  });
  const tabs = [
    { id: null, imageUrl: null, label: t('store_details_tab_offers') },
    ...categories.map((category) => ({
      id: category.id,
      imageUrl: category.imageUrl ?? null,
      label: category.name,
    })),
  ];

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[
        styles.content,
        { gap: spacing.sm, paddingHorizontal: gutter, paddingVertical: spacing.sm },
      ]}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeCategoryId;

        return (
          <StoreDetailTabItem
            id={tab.id}
            imageUrl={tab.imageUrl}
            isActive={isActive}
            key={tab.id ?? 'offers'}
            label={tab.label}
            onLayout={(event) => {
              const { width: tabWidth, x } = event.nativeEvent.layout;
              registerTabLayout(tab.id, { width: tabWidth, x });
            }}
            onPress={() => onSelect(tab.id)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSurface: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 38,
  },
  icon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  image: {
    height: 26,
    width: 26,
  },
});
