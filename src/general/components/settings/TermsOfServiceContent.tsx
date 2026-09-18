import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme';
import Text from '../Text';

type TermsDefinition = { term: string; description: string };
type TermsSection = { heading: string; paragraphs: string[] };

export default function TermsOfServiceContent() {
  const { colors } = useTheme();
  const { t } = useTranslation('general');
  const preambleParagraphs = t('tos_preamble_paragraphs', { returnObjects: true }) as string[];
  const definitions = t('tos_definitions', { returnObjects: true }) as TermsDefinition[];
  const sections = t('tos_sections', { returnObjects: true }) as TermsSection[];

  return (
    <View style={styles.container}>
      <Text variant="title" weight="bold">{t('tos_title')}</Text>
      <Text variant="body" color={colors.mutedText} style={styles.subtitle}>{t('tos_subtitle')}</Text>
      <Text variant="caption" color={colors.mutedText} style={styles.lastUpdated}>
        {t('tos_last_updated')}
      </Text>

      <Text variant="body" weight="bold" style={styles.heading}>{t('tos_preamble_title')}</Text>
      {preambleParagraphs.map((paragraph, index) => (
        <Text key={index} variant="body" color={colors.text} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}

      <Text variant="body" weight="bold" style={styles.heading}>{t('tos_definitions_title')}</Text>
      {definitions.map((definition) => (
        <Text key={definition.term} variant="body" color={colors.text} style={styles.paragraph}>
          <Text variant="body" weight="bold" color={colors.text}>{definition.term}: </Text>
          {definition.description}
        </Text>
      ))}

      {sections.map((section, index) => (
        <View key={index}>
          <Text
            variant="body"
            weight="bold"
            style={section.paragraphs.length === 0 ? styles.partHeading : styles.heading}
          >
            {section.heading}
          </Text>
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <Text key={paragraphIndex} variant="body" color={colors.text} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { marginBottom: 6, marginTop: 20 },
  lastUpdated: { marginBottom: 12, marginTop: 4 },
  paragraph: { lineHeight: 22, marginBottom: 8 },
  partHeading: { marginBottom: 6, marginTop: 28 },
  subtitle: { marginTop: 6 },
});
