import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from '../../../../../general/components/Icon';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';

type Props = {
  deliveryFee?: string | null;
  deliveryTime?: string | null;
  distance?: string | null;
  minimumOrder?: string | null;
};

type Metric = {
  icon: string;
  key: string;
  label: string;
  supportingLabel?: string;
};

export default function StoreDetailInfoRow({
  deliveryFee,
  deliveryTime,
  distance,
  minimumOrder,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const resolvedDeliveryFee = deliveryFee?.trim();
  const resolvedDeliveryTime = deliveryTime?.trim();
  const metrics: Metric[] = [
    resolvedDeliveryFee || resolvedDeliveryTime
      ? {
          icon: 'bicycle-outline',
          key: 'delivery',
          label: resolvedDeliveryFee || resolvedDeliveryTime || '',
          supportingLabel:
            resolvedDeliveryFee && resolvedDeliveryTime
              ? resolvedDeliveryTime
              : undefined,
        }
      : null,
    distance?.trim()
      ? {
          icon: 'location-outline',
          key: 'distance',
          label: distance.trim(),
        }
      : null,
    minimumOrder?.trim()
      ? {
          icon: 'bag-handle-outline',
          key: 'minimum-order',
          label: minimumOrder.trim(),
        }
      : null,
  ].filter((item): item is Metric => item != null);

  if (metrics.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.band,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderRadius: shape.radius.control,
          borderWidth: shape.borderWidth.hairline,
        },
      ]}
    >
      <View style={styles.metrics}>
        {metrics.map((metric, index) => (
          <React.Fragment key={metric.key}>
            {index > 0 ? (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            ) : null}
            <View
              style={[
                styles.metric,
                {
                  gap: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.md,
                },
              ]}
            >
              <Icon
                color={colors.textSubtle}
                name={metric.icon}
                size={18}
                type="Ionicons"
              />
              <View style={styles.metricCopy}>
                <Text
                  color={colors.textSubtle}
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  variant="caption"
                  weight="semiBold"
                >
                  {metric.label}
                </Text>
                {metric.supportingLabel ? (
                  <Text
                    color={colors.textSubtle}
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    variant="caption"
                  >
                    {metric.supportingLabel}
                  </Text>
                ) : null}
              </View>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    overflow: 'hidden',
  },
  metric: {
    alignItems: 'center',
    flexBasis: 0,
    flexDirection: 'row',
    flexGrow: 1,
    minWidth: 0,
  },
  metricCopy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  metrics: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexGrow: 1,
    width: '100%',
  },
  separator: {
    alignSelf: 'stretch',
    marginVertical: 12,
    opacity: 0.72,
    width: StyleSheet.hairlineWidth,
  },
});
