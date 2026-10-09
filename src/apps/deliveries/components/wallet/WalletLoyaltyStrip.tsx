import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  label: string;
  points: number | null;
  isLoading?: boolean;
};

export default function WalletLoyaltyStrip({ label, points, isLoading = false }: Props) {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  return (
    <LinearGradient
      colors={[colors.walletLoyaltySurfaceStart, colors.walletLoyaltySurfaceEnd]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.strip}
    >
      <View style={styles.iconWell}>
        <Ionicons name="sparkles-outline" size={23} color={colors.walletPink} />
      </View>
      <View style={styles.copy}>
        <Text color={colors.walletTextMuted} style={styles.label}>{label}</Text>
        <Text color={colors.text} weight="bold" style={styles.points}>
          {isLoading ? '—' : (points ?? 0).toLocaleString(i18n.language)}
        </Text>
      </View>
      <Image
        source={require('../../assets/wallet/loyalty_gift.png')}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.art}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  strip: { alignItems: 'center', borderRadius: 20, flexDirection: 'row', height: 78, marginHorizontal: 16, marginTop: 14, overflow: 'hidden', paddingHorizontal: 18 },
  iconWell: { alignItems: 'center', justifyContent: 'center', width: 32 },
  copy: { gap: 1, marginLeft: 10, zIndex: 1 },
  label: { fontSize: 12, lineHeight: 16 },
  points: { fontSize: 18, fontVariant: ['tabular-nums'], lineHeight: 23 },
  art: { pointerEvents: 'none', bottom: -13, height: 98, position: 'absolute', right: 3, width: 98 },
});
