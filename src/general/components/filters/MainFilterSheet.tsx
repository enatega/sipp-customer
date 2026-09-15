import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SwipeableBottomSheet from '../SwipeableBottomSheet';
import BottomSheetHandle from '../BottomSheetHandle';
import Button from '../Button';
import Icon from '../Icon';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import type { MainFilterSectionTitles, MainListFilterData, MainListFilters } from './types';
import MainFilterAddressOptionRow from './MainFilterAddressOptionRow';
import MainFilterOptionChip from './MainFilterOptionChip';
import IconButton from '../IconButton';
import { useWindowClass } from '../../hooks/useWindowClass';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  title: string;
  applyLabel: string;
  closeLabel: string;
  filters?: MainListFilterData;
  draftFilters: MainListFilters;
  sectionTitles?: MainFilterSectionTitles;
  isApplyDisabled?: boolean;
  isCategoryVisible?: boolean;
  isStockVisible?: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  onToggleCategory: (categoryId: string) => void;
  onSelectPrice: (priceId: string) => void;
  onSelectAddress: (addressId: string) => void;
  onSelectStock: (stockId: string) => void;
  onSelectSort: (sortId: string) => void;
};

function decodeFilterLabel(label: string) {
  return label?.replaceAll('&amp;', '&');
}

export default function MainFilterSheet({
  visible,
  title,
  applyLabel,
  closeLabel,
  filters,
  draftFilters,
  sectionTitles,
  isApplyDisabled = false,
  isCategoryVisible = true,
  isStockVisible = true,
  onClose,
  onApply,
  onClear,
  onToggleCategory,
  onSelectPrice,
  onSelectAddress,
  onSelectStock,
  onSelectSort,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('general');
  const { gutter, height } = useWindowClass();
  const sheetHeight = Math.min(height * 0.78, 760);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.scrim }]}
          onPress={onClose}
        />

        <SwipeableBottomSheet
          expandedHeight={sheetHeight + insets.bottom}
          collapsedHeight={0}
          initialState="expanded"
          modal
          onCollapsed={onClose}
          style={[
            styles.sheet,
            elevation.overlay,
            {
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: shape.radius.sheet,
              borderTopRightRadius: shape.radius.sheet,
              maxWidth: layout.contentMaxWidth.readable,
            },
          ]}
          handle={<BottomSheetHandle color={colors.iconDisabled} />}
        >
          <View style={[styles.header, { paddingHorizontal: gutter }]}>
            <Pressable
              accessibilityLabel={t('clear_all')}
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClear}
              style={({ pressed }) => [
                styles.clearButton,
                { opacity: pressed ? 0.68 : 1 },
              ]}
            >
              <Text color={colors.primary} variant="label" weight="semiBold">
                {t('clear_all')}
              </Text>
            </Pressable>
            <Text
              weight="bold"
              variant="cardTitle"
              style={styles.headerTitle}
            >
              {title}
            </Text>
            <View style={styles.closeSlot}>
              <IconButton
                accessibilityLabel={closeLabel}
                icon={<Icon type="Entypo" name="cross" size={20} color={colors.text} />}
                onPress={onClose}
                variant="soft"
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              {
                gap: spacing.section.default,
                paddingBottom: insets.bottom + spacing.lg,
                paddingHorizontal: gutter,
              },
            ]}
          >
            {isCategoryVisible && filters?.categories?.length ? (
              <View style={[styles.section, { gap: spacing.md }]}>
                <Text variant="cardTitle" weight="bold">
                  {sectionTitles?.category}
                </Text>
                <View style={[styles.chipWrap, { gap: spacing.sm }]}>
                  {filters.categories.map((category) => {
                    const categoryId = category.ids[0];

                    if (!categoryId) {
                      return null;
                    }

                    return (
                      <MainFilterOptionChip
                        key={categoryId}
                        label={decodeFilterLabel(category.label)}
                        isSelected={draftFilters.category_ids.includes(categoryId)}
                        onPress={() => onToggleCategory(categoryId)}
                      />
                    );
                  })}
                </View>
              </View>
            ) : null}

            {filters?.priceTiers?.length ? (
              <View style={[styles.section, { gap: spacing.md }]}>
                <Text variant="cardTitle" weight="bold">
                  {sectionTitles?.price}
                </Text>
                <FlatList
                  data={filters.priceTiers}
                  horizontal
                  keyExtractor={(item) => item.value}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.flatListContent, { gap: spacing.sm }]}
                  renderItem={({ item: option }) => (
                    <MainFilterOptionChip
                      label={decodeFilterLabel(option.label)}
                      isSelected={draftFilters.price_tiers === option.value}
                      onPress={() => onSelectPrice(option.value)}
                    />
                  )}
                />
              </View>
            ) : null}

            {filters?.addresses?.length ? (
              <View style={[styles.section, { gap: spacing.md }]}>
                <Text variant="cardTitle" weight="bold">
                  {sectionTitles?.address}
                </Text>
                <View style={[styles.addressList, { gap: spacing.sm }]}>
                  {filters.addresses.map((option) => (
                    <MainFilterAddressOptionRow
                      key={option.id}
                      label={decodeFilterLabel(option.label)}
                      description={option.description ?? undefined}
                      isSelected={draftFilters.address_id === option.id}
                      onPress={() => onSelectAddress(option.id)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Todo: can add stock based filter after backend handling */}
            {/* {isStockVisible && filters?.stock?.length ? (
              <View style={[styles.section, { gap: spacing.md }]}>
                <Text variant="cardTitle" weight="bold">
                  {sectionTitles?.stock}
                </Text>
                <FlatList
                  data={filters.stock}
                  horizontal
                  keyExtractor={(item) => item.value}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.flatListContent, { gap: spacing.sm }]}
                  renderItem={({ item: option }) => (
                    <MainFilterOptionChip
                      label={decodeFilterLabel(option.label)}
                      isSelected={draftFilters.stock === option.value}
                      onPress={() => onSelectStock(option.value)}
                    />
                  )}
                />
              </View>
            ) : null} */}

            {filters?.sortBy?.length ? (
              <View style={[styles.section, { gap: spacing.md }]}>
                <Text variant="cardTitle" weight="bold">
                  {sectionTitles?.sort}
                </Text>
                <FlatList
                  data={filters.sortBy}
                  horizontal
                  keyExtractor={(item) => item.value}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.flatListContent, { gap: spacing.sm }]}
                  renderItem={({ item: option }) => (
                    <MainFilterOptionChip
                      label={decodeFilterLabel(option.label)}
                      isSelected={draftFilters.sort_by === option.value}
                      onPress={() => onSelectSort(option.value)}
                    />
                  )}
                />
              </View>
            ) : null}

            <View style={[styles.actions, { marginTop: spacing.sm }]}>
              <Button
                label={applyLabel}
                onPress={onApply}
                disabled={isApplyDisabled}
                style={styles.applyButton}
              />
            </View>
          </ScrollView>
        </SwipeableBottomSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {},
  addressList: {},
  applyButton: {
    width: '100%',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clearButton: {
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 72,
  },
  closeSlot: {
    alignItems: 'flex-end',
    width: 72,
  },
  flatListContent: {
    paddingRight: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {},
  sheet: {
    alignSelf: 'center',
    width: '100%',
  },
});
