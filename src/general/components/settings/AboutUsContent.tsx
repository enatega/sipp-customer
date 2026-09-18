import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import Text from '../Text';

export default function AboutUsContent() {
  const { colors } = useTheme();
  const { t } = useTranslation('general');
  const originParagraphs = t('about_origin_paragraphs', { returnObjects: true }) as string[];
  const differentItems = t('about_different_items', { returnObjects: true }) as string[];
  const localParagraphs = t('about_local_paragraphs', { returnObjects: true }) as string[];
  const missionParagraphs = t('about_mission_paragraphs', { returnObjects: true }) as string[];

  return (
    <View style={styles.container}>
      <Text variant="title" weight="bold">{t('about_title')}</Text>
      <Text variant="body" color={colors.mutedText} style={styles.subtitle}>{t('about_subtitle')}</Text>

      <Text variant="body" weight="bold" style={styles.heading}>{t('about_origin_title')}</Text>
      {originParagraphs.map((paragraph, index) => (
        <Text key={index} variant="body" color={colors.text} style={styles.paragraph}>{paragraph}</Text>
      ))}

      <Text variant="body" weight="bold" style={styles.heading}>{t('about_different_title')}</Text>
      <Text variant="body" color={colors.text} style={styles.paragraph}>{t('about_different_intro')}</Text>
      <Text variant="body" weight="bold" color={colors.text} style={styles.focusLabel}>{t('about_different_focus_label')}</Text>
      {differentItems.map((item) => (
        <View key={item} style={styles.checklistRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.checklistIcon} />
          <Text variant="body" color={colors.text} style={styles.checklistText}>{item}</Text>
        </View>
      ))}
      <Text variant="body" color={colors.text} style={styles.paragraph}>{t('about_different_outro')}</Text>
      <Text variant="body" color={colors.text} style={styles.paragraph}>{t('about_different_result')}</Text>

      <Text variant="body" weight="bold" style={styles.heading}>{t('about_local_title')}</Text>
      {localParagraphs.map((paragraph, index) => (
        <Text key={index} variant="body" color={colors.text} style={styles.paragraph}>{paragraph}</Text>
      ))}

      <Text variant="body" weight="bold" style={styles.heading}>{t('about_mission_title')}</Text>
      <Text variant="body" weight="bold" color={colors.text} style={styles.paragraph}>{t('about_mission_statement')}</Text>
      {missionParagraphs.map((paragraph, index) => (
        <Text key={index} variant="body" color={colors.text} style={styles.paragraph}>{paragraph}</Text>
      ))}

      <View style={[styles.taglineCard, { borderColor: colors.border }]}>
        <Text variant="caption" color={colors.mutedText}>{t('about_tagline_label')}</Text>
        <Text variant="subtitle" weight="bold" style={styles.taglineValue}>{t('about_tagline_value')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  checklistIcon: { marginRight: 8, marginTop: 2 },
  checklistRow: { flexDirection: 'row', marginBottom: 8 },
  checklistText: { flex: 1, lineHeight: 22 },
  container: { padding: 16 },
  focusLabel: { marginBottom: 8, marginTop: 12 },
  heading: { marginBottom: 6, marginTop: 20 },
  paragraph: { lineHeight: 22, marginBottom: 8 },
  subtitle: { marginTop: 6 },
  taglineCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    padding: 20,
  },
  taglineValue: { marginTop: 4, textAlign: 'center' },
});
