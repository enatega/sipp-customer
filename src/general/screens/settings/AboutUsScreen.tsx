import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme';
import ScreenHeader from '../../components/ScreenHeader';
import AboutUsContent from '../../components/settings/AboutUsContent';

export default function AboutUsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('general');

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('settings_about_us')} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AboutUsContent />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollView: { flex: 1 },
});
