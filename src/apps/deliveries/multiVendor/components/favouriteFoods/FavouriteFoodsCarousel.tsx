import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Image from '../../../../../general/components/Image';
import PressableScale from '../../../../../general/components/PressableScale';
import Skeleton from '../../../../../general/components/Skeleton';
import Text from '../../../../../general/components/Text';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryFavouriteFood } from '../../../api/types';
import { useFavouriteFoods } from '../../../hooks/useFavouriteFoods';
import { getLocalizedProductName } from '../../../utils/productTranslation';

type Props = {
  shopTypeId?: string | null;
  onFoodPress: (food: DeliveryFavouriteFood) => void;
};

export default function FavouriteFoodsCarousel({ shopTypeId, onFoodPress }: Props) {
  const { t, i18n } = useTranslation('deliveries');
  const { colors, shape, spacing } = useTheme();
  const { width, gutter, fontScale } = useWindowClass();
  const isFocused = useIsFocused();
  const isReducedMotion = useReducedMotion();
  const { data = [], isPending, isError, refetch } = useFavouriteFoods();
  const foods = useMemo(() => shopTypeId
    ? data.filter((food) => food.shopTypeIds.includes(shopTypeId))
    : data, [data, shopTypeId]);
  const gap = spacing.sm;
  const cardWidth = Math.round(Math.min(156, Math.max(132, Math.floor((width - gutter * 2 - spacing.md * 1.5) / 2.5))) * 0.66);
  const footerHeight = Math.max(34, Math.ceil(32 * fontScale));
  const cardHeight = Math.max(cardWidth + spacing.xxl, footerHeight + Math.round(cardWidth * 0.7));
  const cardSurface = { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: shape.radius.control };
  const maxOffset = Math.max(0, foods.length * (cardWidth + gap) - gap - (width - gutter * 2));
  const maxIndex = Math.max(0, Math.ceil(
    maxOffset / (cardWidth + gap),
  ));
  const listRef = useRef<FlatList<DeliveryFavouriteFood>>(null);
  const indexRef = useRef(0);
  const directionRef = useRef<1 | -1>(1);
  const pauseUntilRef = useRef(0);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setIsAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    indexRef.current = 0;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [shopTypeId]);

  useEffect(() => {
    const next = Math.min(indexRef.current, maxIndex);
    indexRef.current = next;
    listRef.current?.scrollToOffset({ offset: next * (cardWidth + gap), animated: false });
  }, [cardWidth, gap, maxIndex]);

  const moveTo = useCallback((index: number, animated = true) => {
    const next = Math.max(0, Math.min(index, maxIndex));
    if (next === indexRef.current) return;
    indexRef.current = next;
    listRef.current?.scrollToOffset({ offset: next * (cardWidth + gap), animated: animated && !isReducedMotion });
  }, [cardWidth, gap, isReducedMotion, maxIndex]);

  useEffect(() => {
    if (!isFocused || !isAppActive || isReducedMotion || maxIndex === 0) return;
    const timer = setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      if (indexRef.current >= maxIndex) directionRef.current = -1;
      if (indexRef.current <= 0) directionRef.current = 1;
      moveTo(indexRef.current + directionRef.current);
    }, 4200);
    return () => clearInterval(timer);
  }, [isAppActive, isFocused, isReducedMotion, maxIndex, moveTo]);

  if (isPending) {
    return (
      <View style={[styles.skeletons, { gap, paddingHorizontal: gutter }]} accessibilityLabel={t('favourite_foods_loading')}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
          <View key={key} style={[styles.card, cardSurface, { width: cardWidth, height: cardHeight }]}>
            <Skeleton width={cardWidth} height={cardHeight - footerHeight} borderRadius={0} />
            <View style={[styles.footer, { height: footerHeight }]}>
              <Skeleton width={cardWidth * 0.62} height={12} borderRadius={shape.radius.xs} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <PressableScale accessibilityRole="button" accessibilityLabel={t('favourite_foods_retry')}
        onPress={() => void refetch()} style={[styles.retry, { marginHorizontal: gutter, backgroundColor: colors.surfaceSunken }]}>
        <Text color={colors.textSubtle} variant="supporting">{t('favourite_foods_retry')}</Text>
      </PressableScale>
    );
  }

  if (!foods.length) return null;

  return (
    <View accessibilityLabel={t('favourite_foods_browse')} style={styles.section}>
      <FlatList
        ref={listRef}
        horizontal
        data={foods}
        keyExtractor={(food) => food.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + gap}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: cardWidth + gap, offset: (cardWidth + gap) * index, index })}
        contentContainerStyle={{ gap, paddingHorizontal: gutter, paddingVertical: spacing.xs }}
        onScrollBeginDrag={() => { pauseUntilRef.current = Date.now() + 8000; }}
        onMomentumScrollEnd={(event) => {
          const offset = event.nativeEvent.contentOffset.x;
          const next = offset >= maxOffset - 2
            ? maxIndex : Math.min(maxIndex, Math.max(0, Math.round(offset / (cardWidth + gap))));
          indexRef.current = next;
        }}
        renderItem={({ item }) => {
          const name = getLocalizedProductName({ name: item.name, nameTranslations: item.nameTranslations }, i18n.language);
          return (
            <PressableScale accessibilityRole="button" accessibilityLabel={t('favourite_foods_open', { name })}
              onPress={() => onFoodPress(item)} pressedScale={0.97} style={[styles.card, cardSurface, { width: cardWidth, height: cardHeight }]}>
              <View style={[styles.imageFrame, { backgroundColor: colors.primarySoft }]}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                  : <Ionicons name="restaurant-outline" color={colors.primary} size={Math.min(28, cardWidth * 0.34)} />}
              </View>
              <View style={[styles.footer, { height: footerHeight }]}>
                <Text color={colors.textStrong} variant="caption" weight="semiBold" numberOfLines={2} style={styles.name}>{name}</Text>
              </View>
            </PressableScale>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { width: '100%' },
  card: { overflow: 'hidden', borderWidth: 1 },
  imageFrame: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%', transform: [{ scale: 1.3 }] },
  footer: { justifyContent: 'center', paddingHorizontal: 8 },
  name: { textAlign: 'left', width: '100%' },
  skeletons: { flexDirection: 'row', overflow: 'hidden', paddingVertical: 4 },
  retry: { alignItems: 'center', borderRadius: 12, justifyContent: 'center', minHeight: 48 },
});
