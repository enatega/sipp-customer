import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../general/components/Skeleton';
import { useTheme } from '../../../../general/theme/theme';

export default function SupportTicketsSkeleton() {
  const { colors, shape } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={`support-ticket-skeleton-${index}`}
          style={[
            styles.card,
            {
              borderColor: colors.border,
              borderRadius: shape.radius.hero,
            },
          ]}
        >
          <Skeleton borderRadius={shape.radius.sm} height={42} width={42} />
          <View style={styles.copy}>
            <Skeleton borderRadius={4} height={16} width="68%" />
            <Skeleton borderRadius={4} height={12} width="86%" />
            <View style={styles.meta}>
              <Skeleton borderRadius={shape.radius.pill} height={22} width={88} />
              <Skeleton borderRadius={shape.radius.pill} height={22} width={62} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  container: {
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 10,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
});
