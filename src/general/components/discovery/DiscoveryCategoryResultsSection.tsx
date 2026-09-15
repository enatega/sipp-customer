import React from 'react';
import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import HorizontalList from '../HorizontalList';
import SectionActionHeader from '../SectionActionHeader';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import DiscoveryResultsSkeleton from './DiscoveryResultsSkeleton';
import DiscoverySectionState from './DiscoverySectionState';

type StateCopy = {
  message?: string;
  title?: string;
};

type Props<T> = {
  title: string;
  items: T[];
  isLoading: boolean;
  hasError: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
  renderItem: (item: T) => ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  loadingComponent?: ReactNode;
  emptyState?: StateCopy;
  errorState?: StateCopy;
};

export default function DiscoveryCategoryResultsSection<T>({
  title,
  items,
  isLoading,
  hasError,
  actionLabel,
  onActionPress,
  renderItem,
  keyExtractor,
  loadingComponent,
  emptyState,
  errorState,
}: Props<T>) {
  const { spacing, typography } = useTheme();
  const isEmpty = !isLoading && !hasError && items.length === 0;

  return (
    <View style={[styles.section, { gap: spacing.md }]}>
      {actionLabel ? (
        <SectionActionHeader
          actionLabel={actionLabel}
          onActionPress={onActionPress}
          title={title}
        />
      ) : (
        <Text
          weight="extraBold"
          accessibilityRole="header"
          style={typography.role.sectionTitle}
        >
          {title}
        </Text>
      )}

      {isLoading ? (
        loadingComponent ?? <DiscoveryResultsSkeleton />
      ) : hasError ? (
        <DiscoverySectionState
          tone="error"
          title={errorState?.title}
          message={errorState?.message}
        />
      ) : isEmpty ? (
        <DiscoverySectionState
          title={emptyState?.title}
          message={emptyState?.message}
        />
      ) : (
        <HorizontalList
          data={items}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            paddingBottom: spacing.lg,
            paddingRight: spacing.lg,
            paddingTop: spacing.xs,
          }}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => renderItem(item)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
});
