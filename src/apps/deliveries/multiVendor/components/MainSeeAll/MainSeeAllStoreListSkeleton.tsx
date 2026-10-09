import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../../general/components/Skeleton';
import { useTheme } from '../../../../../general/theme/theme';

const SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => index);

export default function MainSeeAllStoreListSkeleton() {
  const { colors, elevation, shape, spacing } = useTheme();

  return (
    <View style={styles.listContent}>
      {SKELETON_ITEMS.map((index) => (
        <React.Fragment key={index}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderRadius: shape.radius.surface,
                ...elevation.raised,
              },
            ]}
          >
            <View
              style={[
                styles.imageContainer,
                {
                  borderTopLeftRadius: shape.radius.surface,
                  borderBottomLeftRadius: shape.radius.surface,
                },
              ]}
            >
              <Skeleton height={132} width={116} borderRadius={0} />
            </View>
            <View style={[styles.content, { gap: spacing.sm, padding: spacing.md }]}>
              <Skeleton height={20} width="72%" />
              <Skeleton height={14} width="44%" />
              <View style={styles.metaRow}>
                <Skeleton height={14} width={46} />
                <Skeleton height={14} width={52} />
                <Skeleton height={14} width={54} />
              </View>
              <Skeleton height={14} width={68} />
            </View>
          </View>
          {index < SKELETON_ITEMS.length - 1 ? <View style={styles.separator} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
    flexDirection: 'row',
    minHeight: 132,
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  imageContainer: {
    height: 132,
    overflow: 'hidden',
    width: 116,
  },
  listContent: {
    paddingBottom: 24,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  separator: {
    height: 12,
  },
});
