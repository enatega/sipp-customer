import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme';
import Text from '../Text';

type HowItWorksStep = { title: string; description: string };

export default function HowItWorksContent() {
  const { colors } = useTheme();
  const { t } = useTranslation('general');
  const steps = t('how_it_works_steps', { returnObjects: true }) as HowItWorksStep[];

  return (
    <View style={styles.container}>
      <Text variant="title" weight="bold">{t('how_it_works_title')}</Text>
      <Text variant="body" color={colors.text} style={styles.paragraph}>{t('how_it_works_subtitle')}</Text>

      <Text variant="body" weight="bold" style={styles.heading}>{t('how_it_works_steps_title')}</Text>
      {steps.map((step, index) => (
        <View key={step.title} style={styles.stepRow}>
          <View style={[styles.stepBadge, { backgroundColor: colors.primarySoft }]}>
            <Text variant="body" weight="bold" color={colors.primary}>{index + 1}</Text>
          </View>
          <View style={styles.stepTextWrap}>
            <Text variant="body" weight="bold" color={colors.text}>{step.title}</Text>
            <Text variant="body" color={colors.text} style={styles.stepDescription}>{step.description}</Text>
          </View>
        </View>
      ))}

      <Text variant="body" weight="bold" style={styles.heading}>{t('how_it_works_delivery_area_title')}</Text>
      <Text variant="body" color={colors.text} style={styles.paragraph}>{t('how_it_works_delivery_area_body')}</Text>

      <Text variant="body" color={colors.mutedText} style={styles.closing}>{t('how_it_works_closing_body')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  closing: { fontStyle: 'italic', lineHeight: 22, marginBottom: 8, marginTop: 20 },
  container: { padding: 16 },
  heading: { marginBottom: 12, marginTop: 20 },
  paragraph: { lineHeight: 22, marginBottom: 8 },
  stepBadge: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  stepDescription: { lineHeight: 20, marginTop: 4 },
  stepRow: { flexDirection: 'row', marginBottom: 16 },
  stepTextWrap: { flex: 1 },
});
