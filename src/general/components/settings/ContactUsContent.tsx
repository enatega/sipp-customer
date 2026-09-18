import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/theme';
import Text from '../Text';
import PressableScale from '../PressableScale';
import { showToast } from '../AppToast';
import type { DeliveriesStackParamList } from '../../../apps/deliveries/navigation/types';

const CONTACT_PHONE = '+50670445484';
const CONTACT_EMAIL = 'support@sippdelivery.com';

const SOCIAL_LINKS = [
  { key: 'facebook', icon: 'logo-facebook' as const, url: 'https://www.facebook.com/people/SIPP-FoodDrinksMore/61571445882236/' },
  { key: 'instagram', icon: 'logo-instagram' as const, url: 'https://www.instagram.com/sippdelivery/' },
  { key: 'linkedin', icon: 'logo-linkedin' as const, url: 'https://www.linkedin.com/company/sipp-delivery/about/' },
];

export default function ContactUsContent() {
  const { colors, shape, spacing } = useTheme();
  const { t } = useTranslation('general');
  const navigation = useNavigation<NativeStackNavigationProp<DeliveriesStackParamList>>();

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      showToast.error(t('contact_error_generic'));
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="title" weight="bold">{t('contact_title')}</Text>
      <Text variant="body" weight="bold" color={colors.text} style={styles.tagline}>{t('contact_tagline')}</Text>
      <Text variant="body" color={colors.mutedText} style={styles.paragraph}>{t('contact_body')}</Text>

      <PressableScale
        accessibilityRole="button"
        onPress={() => void openLink(`https://wa.me/${CONTACT_PHONE.replace('+', '')}`)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: shape.radius.surface, padding: spacing.md }]}
      >
        <Text variant="body" weight="bold" color={colors.text}>{t('contact_whatsapp_title')}</Text>
        <Text variant="caption" color={colors.mutedText} style={styles.cardSubtitle}>{t('contact_whatsapp_subtitle')}</Text>
        <Text variant="body" color={colors.primary} style={styles.cardAction}>{t('contact_phone_display')}</Text>
      </PressableScale>

      <PressableScale
        accessibilityRole="button"
        onPress={() => void openLink(`mailto:${CONTACT_EMAIL}`)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: shape.radius.surface, padding: spacing.md }]}
      >
        <Text variant="body" weight="bold" color={colors.text}>{t('contact_email_title')}</Text>
        <Text variant="caption" color={colors.mutedText} style={styles.cardSubtitle}>{t('contact_email_subtitle')}</Text>
        <Text variant="body" color={colors.primary} style={styles.cardAction}>{CONTACT_EMAIL}</Text>
      </PressableScale>

      <PressableScale
        accessibilityRole="button"
        onPress={() => navigation.navigate('Support')}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: shape.radius.surface, padding: spacing.md }]}
      >
        <Text variant="body" weight="bold" color={colors.text}>{t('contact_support_title')}</Text>
        <Text variant="caption" color={colors.mutedText} style={styles.cardSubtitle}>{t('contact_support_subtitle')}</Text>
        <Text variant="body" color={colors.primary} style={styles.cardAction}>{t('contact_support_cta')} →</Text>
      </PressableScale>

      <Text variant="body" color={colors.text} style={styles.address}>{t('contact_address')}</Text>

      <Text variant="body" weight="bold" style={styles.socialHeading}>{t('contact_social_title')}</Text>
      <View style={styles.socialRow}>
        {SOCIAL_LINKS.map((social) => (
          <PressableScale
            accessibilityRole="button"
            key={social.key}
            onPress={() => void openLink(social.url)}
            style={[styles.socialButton, { backgroundColor: colors.surfaceSunken, borderRadius: shape.radius.pill }]}
          >
            <Ionicons name={social.icon} size={22} color={colors.text} />
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  address: { lineHeight: 20, marginTop: 4 },
  card: { borderWidth: 1, marginBottom: 12 },
  cardAction: { fontWeight: '600', marginTop: 8 },
  cardSubtitle: { marginTop: 2 },
  container: { padding: 16 },
  paragraph: { lineHeight: 22, marginBottom: 20, marginTop: 8 },
  socialButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  socialHeading: { marginBottom: 12, marginTop: 24 },
  socialRow: { flexDirection: 'row' },
  tagline: { marginTop: 8 },
});
