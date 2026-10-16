import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../general/components/Text';
import { useTheme } from '../general/theme/theme';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('general');

  return (
    <LinearGradient
      colors={[colors.splashGradientStart, colors.splashGradientEnd]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      
      <View style={styles.loader}>
        <ActivityIndicator color={colors.white} />
        <Text variant="caption" color={colors.white} style={styles.loadingText}>
          {t('loading')}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 48,
  },
  loadingText: {
    opacity: 0.9,
  },
});
