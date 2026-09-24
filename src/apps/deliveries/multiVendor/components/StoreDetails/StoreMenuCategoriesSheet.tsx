import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Text from '../../../../../general/components/Text';
import Button from '../../../../../general/components/Button';
import PressableScale from '../../../../../general/components/PressableScale';
import { useTheme } from '../../../../../general/theme/theme';
import { useReducedMotion } from '../../../../../general/hooks/useReducedMotion';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';

type Props = {
  visible: boolean;
  categories: DeliveryStoreDetailsFilterItem[];
  activeCategoryId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function StoreMenuCategoriesSheet({ visible, categories, activeCategoryId, onSelect, onClose }: Props) {
  const { colors, spacing, shape, layout } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation('deliveries');
  const reducedMotion = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType={reducedMotion ? 'none' : 'slide'} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.scrim }]}>
        <Pressable accessibilityLabel={t('store_details_close')} accessibilityRole="button"
          style={StyleSheet.absoluteFill} onPress={onClose} />
        <View accessibilityViewIsModal style={[styles.sheet, {
          backgroundColor: colors.canvas, borderTopLeftRadius: shape.radius.sheet,
          borderTopRightRadius: shape.radius.sheet, padding: spacing.lg, paddingBottom: bottom + spacing.lg,
        }]}>
          <Text accessibilityRole="header" variant="sectionTitle" weight="bold" style={{ marginBottom: spacing.md }}>
            {t('store_menu_all_categories')}
          </Text>
          <FlatList data={categories} keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PressableScale accessibilityRole="button" accessibilityState={{ selected: item.id === activeCategoryId }}
                onPress={() => { onSelect(item.id); onClose(); }}
                style={{ minHeight: layout.touchTarget.comfortable, paddingVertical: spacing.md }}>
                <Text color={item.id === activeCategoryId ? colors.primary : colors.text} variant="body">{item.name}</Text>
              </PressableScale>
            )} />
          <Button label={t('store_details_close')} onPress={onClose} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { height: '70%' },
});
