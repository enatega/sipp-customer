import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../components/Icon';
import { useTheme } from '../../../theme/theme';
import type { GenericListHeaderRenderProps } from '../../../components/filterablePaginatedList';
import { resetToSharedRoute } from '../../../navigation/rootNavigation';
import IconButton from '../../../components/IconButton';
import { useWindowClass } from '../../../hooks/useWindowClass';
import PlatformGlassSurface from '../../../components/PlatformGlassSurface';

export default function SeeAllHeader({
  searchPlaceholder,
  searchValue,
  onSearchChangeText,
  onSearchPress,
  isSearchEditable,
  onOpenFilters,
  onMapPress,
  isSearchVisible,
  isFilterVisible,
  isMapVisible,
  renderSearchInput,
}: GenericListHeaderRenderProps) {
  const { t } = useTranslation('general');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, elevation, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();

  const searchInput = renderSearchInput({
    value: searchValue,
    onChangeText: onSearchChangeText,
    placeholder: searchPlaceholder,
    editable: isSearchEditable,
  });

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    resetToSharedRoute('Deliveries', {
      screen: 'MultiVendor',
      params: {
        screen: 'MultiVendorTabs',
        params: {
          screen: 'MultiVendorTabHome',
        },
      },
    });
  };

  const content = (
    <View
      style={[
        styles.container,
        elevation.raised,
        {
          borderBottomColor: colors.divider,
          gap: spacing.sm,
          maxWidth: layout.contentMaxWidth.expanded,
          paddingBottom: spacing.md,
          paddingHorizontal: gutter,
          paddingTop: insets.top + spacing.sm,
        },
      ]}
    >
      <IconButton
        accessibilityLabel={t('see_all_back_label')}
        icon={<Icon type="Ionicons" name="arrow-back" size={22} color={colors.text} />}
        onPress={handleBackPress}
        variant="soft"
      />

      {isSearchVisible ? (
        isSearchEditable ? (
          <View style={styles.searchContainer}>{searchInput}</View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchPlaceholder}
            onPress={onSearchPress}
            style={styles.searchContainer}
          >
            <View pointerEvents="none">{searchInput}</View>
          </Pressable>
        )
      ) : (
        <View style={styles.spacer} />
      )}

      {isFilterVisible ? (
        <IconButton
          accessibilityLabel={t('see_all_open_filters_label')}
          icon={<Icon type="Feather" name="sliders" size={20} color={colors.text} />}
          onPress={onOpenFilters}
          variant="soft"
        />
      ) : null}

      {isMapVisible ? (
        <IconButton
          accessibilityLabel={t('see_all_map_view_label')}
          icon={<Icon type="Feather" name="map" size={20} color={colors.text} />}
          onPress={onMapPress}
          variant="soft"
        />
      ) : null}
    </View>
  );

  return <PlatformGlassSurface>{content}</PlatformGlassSurface>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    width: '100%',
  },
  searchContainer: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
});
