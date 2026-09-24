import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import Text from '../../../../general/components/Text';
import { useWalletBalanceVisibilityStore } from '../../../../general/stores/useWalletBalanceVisibilityStore';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  balance: number | null | undefined;
  balanceLabel: string;
  currency: string;
  actionLabel: string;
  onAction: () => void;
  isLoading?: boolean;
  isError?: boolean;
};

export default function WalletBalanceCard({ balance, balanceLabel, currency, actionLabel, onAction, isLoading = false, isError = false }: Props) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const isVisible = useWalletBalanceVisibilityStore((state) => state.isVisible);
  const toggleVisibility = useWalletBalanceVisibilityStore((state) => state.toggleVisibility);
  const formattedBalance = `${currency} ${Number(balance ?? 0).toLocaleString(i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <LinearGradient
      colors={[colors.walletHeroStart, colors.walletHeroMiddle, colors.walletHeroEnd]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Image
        source={require('../../assets/wallet/hero_wallet_stack.png')}
        resizeMode="contain"
        style={styles.illustration}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <Text color={colors.white} weight="medium" style={styles.label}>{balanceLabel}</Text>
      <View style={styles.balanceRow}>
        {isLoading ? <ActivityIndicator color={colors.white} /> : (
          <Text color={colors.white} weight="bold" style={[styles.balance, { textShadowColor: colors.walletHeroTextShadow }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {isVisible ? (isError ? '—' : formattedBalance) : `${currency} ••••••`}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isVisible ? t('wallet_hide_balance') : t('wallet_show_balance')}
          accessibilityState={{ disabled: isLoading || isError }}
          disabled={isLoading || isError}
          onPress={toggleVisibility}
          style={styles.eyeButton}
        >
          <PlatformGlassSurface style={styles.eyeGlass} scrimColor={colors.glassSurface}>
            <Ionicons name={isVisible ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.walletHeroStart} />
          </PlatformGlassSurface>
        </Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.detailsButton}>
        <Text color={colors.white} weight="medium" style={styles.detailsText}>{actionLabel}</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.white} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 28, height: 164, marginHorizontal: 16, marginTop: 4, overflow: 'hidden', padding: 20 },
  illustration: { height: 198, position: 'absolute', right: -20, top: -13, width: 270 },
  label: { fontSize: 14, lineHeight: 19, zIndex: 1 },
  balanceRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 9, zIndex: 1 },
  balance: { flexShrink: 1, fontSize: 36, fontVariant: ['tabular-nums'], letterSpacing: -0.7, lineHeight: 42, textShadowRadius: 6 },
  eyeButton: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  eyeGlass: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', overflow: 'hidden', width: 32 },
  detailsButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.17)', borderColor: 'rgba(255,255,255,0.22)', borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 5, marginTop: 21, minHeight: 28, paddingHorizontal: 10, zIndex: 1 },
  detailsText: { fontSize: 11, lineHeight: 15 },
});
