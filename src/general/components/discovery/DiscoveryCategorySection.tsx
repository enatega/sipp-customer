import React from 'react';
import { StyleSheet, View } from 'react-native';
import HorizontalList from '../HorizontalList';
import SectionActionHeader from '../SectionActionHeader';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import DiscoveryCategoryCard from './DiscoveryCategoryCard';
import DiscoveryCategorySkeleton from './DiscoveryCategorySkeleton';
import type { DiscoveryCategoryItem } from './types';
import { useWindowClass } from '../../hooks/useWindowClass';

type Props = {
  items: DiscoveryCategoryItem[];
  isPending: boolean;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onItemPress?: (item: DiscoveryCategoryItem) => void;
  variant?: 'default' | 'home';
};

export default function DiscoveryCategorySection({
  items,
  isPending,
  title,
  actionLabel,
  onActionPress,
  onItemPress,
  variant = 'default',
}: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const isHomeVariant = variant === 'home';

  return (
    <View
      style={[
        styles.section,
        {
          gap: isHomeVariant ? spacing.sm : spacing.md,
          paddingHorizontal: gutter,
        },
      ]}
    >
      {isHomeVariant ? null : actionLabel ? (
        <SectionActionHeader
          actionLabel={actionLabel}
          title={title}
          onActionPress={onActionPress}
        />
      ) : (
        <Text
          accessibilityRole="header"
          variant="cardTitle"
          weight="semiBold"
        >
          {title}
        </Text>
      )}

      {isPending ? (
        <DiscoveryCategorySkeleton variant={variant} />
      ) : (
        <HorizontalList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: isHomeVariant ? spacing.xs : spacing.lg,
            paddingRight: gutter,
            paddingTop: isHomeVariant ? 0 : spacing.xs,
          }}
          ItemSeparatorComponent={() => (
            <View style={{ width: isHomeVariant ? spacing.xs : spacing.md }} />
          )}
          renderItem={({ item }) => (
            <DiscoveryCategoryCard
              imageUrl={item.imageUrl}
              title={item.name}
              onPress={onItemPress ? () => onItemPress(item) : undefined}
              variant={variant}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
  },
});
