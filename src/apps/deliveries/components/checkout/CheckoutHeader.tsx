import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import PressableScale from '../../../../general/components/PressableScale';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  backIconName?: React.ComponentProps<typeof Ionicons>['name'];
  onBackPress: () => void;
  title?: string;
};

export default function CheckoutHeader({
  backIconName = 'chevron-back',
  onBackPress,
  title,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();

  return (
    <View style={[styles.shell, { backgroundColor: colors.canvas, paddingTop: insets.top }]}>
      <View style={[styles.container, { gap: spacing.md, maxWidth: layout.contentMaxWidth.readable, paddingHorizontal: gutter }]}>
      <PressableScale
        accessibilityLabel={t('store_details_action_back')}
        accessibilityRole="button"
        onPress={onBackPress}
        style={[
          styles.backButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <Ionicons color={colors.text} name={backIconName} size={22} />
      </PressableScale>

      <Text
        accessibilityRole="header"
        numberOfLines={1}
        variant="sectionTitle"
        weight="bold"
      >
        {title ?? t('checkout_title')}
      </Text>

      <View style={styles.trailingSpace} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 'auto',
    paddingBottom: 10,
    paddingTop: 8,
    width: '100%',
  },
  shell: {
    width: '100%',
  },
  trailingSpace: {
    width: 44,
  },
});
