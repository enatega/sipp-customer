import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../general/components/Text';
import Card from '../../general/components/Card';
import Image from '../../general/components/Image';
import { useTheme } from '../../general/theme/theme';
import { useTranslation } from 'react-i18next';
import { MiniAppId } from '../../general/utils/constants';
import { serviceIcons } from '../../general/assets/images';
import {
  APP_ROUTE_BY_ID,
  type MiniAppRouteParamsById,
} from '../../apps/registry/generated/appRegistry';

type ServiceItem = {
  id: MiniAppId;
  title: string;
  background: string;
  icon: number;
  params?: MiniAppRouteParamsById[MiniAppId];
};

type Props = {
  onSelectMiniApp?: (id: MiniAppId, params?: MiniAppRouteParamsById[MiniAppId]) => void;
};

export default function OurServicesSection({ onSelectMiniApp }: Props) {
  const { colors, shape, spacing, typography } = useTheme();
  const { t } = useTranslation('general');

  const allItems: ServiceItem[] = [
    { id: 'deliveries', title: t('service_deliveries'), icon: serviceIcons.deliveries, background: colors.cardSoft },
  ];

  const items = allItems.filter((service) => APP_ROUTE_BY_ID[service.id] != null);

  return (
    <View style={[styles.section, { gap: spacing.md }]}> 
      <Text variant="subtitle" weight="semiBold" accessibilityRole="header" style={styles.sectionTitle}>
        {t('services_title')}
      </Text>
      <View style={styles.grid}>
        {items.map((service) => (
          <Pressable
            key={service.id}
            onPress={() => onSelectMiniApp?.(service.id, service.params)}
            style={styles.cell}
            accessibilityRole="button"
            accessibilityLabel={service.title}
          >
            <Card
              elevation="raised"
              style={[
                styles.card,
                {
                  backgroundColor: service.background,
                  borderRadius: shape.radius.surface,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                },
              ]}
            >
              <Text
                weight="semiBold"
                numberOfLines={2}
                style={[styles.title, { fontSize: typography.size.sm, lineHeight: typography.lineHeight.sm }]}
              >
                {service.title}
              </Text>
              <View style={[styles.iconWrap, { backgroundColor: colors.surface, borderRadius: shape.radius.control }]}> 
                <Image source={service.icon} style={styles.icon} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
  sectionTitle: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    width: '48%',
  },
  card: {
    minHeight: 80,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    maxWidth: 90,
  },
  iconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
});
