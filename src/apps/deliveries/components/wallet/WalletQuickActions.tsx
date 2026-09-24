import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../../../general/components/Text';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  addMoneyLabel: string;
  convertLabel: string;
  cardsLabel: string;
  onAddMoney: () => void;
  onConvert: () => void;
  onCards: () => void;
};

export default function WalletQuickActions({ addMoneyLabel, convertLabel, cardsLabel, onAddMoney, onConvert, onCards }: Props) {
  const { colors, isDark } = useTheme();
  const isReducedMotion = useReducedMotion();
  const actions = [
    { key: 'add', label: addMoneyLabel, icon: 'add' as const, tint: colors.white, fill: ['#55C8FF', '#0870F4'] as [string, string], glow: '#2698FF', onPress: onAddMoney },
    { key: 'convert', label: convertLabel, icon: 'sparkles-outline' as const, tint: colors.walletPink, fill: isDark ? ['#362039', '#1C2344'] as [string, string] : ['#FFF9FF', '#FFE8F6'] as [string, string], glow: '#EC5ECB', onPress: onConvert },
    { key: 'cards', label: cardsLabel, icon: 'card-outline' as const, tint: colors.walletIndigo, fill: isDark ? ['#173A61', '#1D255A'] as [string, string] : ['#E9F8FF', '#D9EFFF'] as [string, string], glow: '#6A96FF', onPress: onCards },
  ];

  return (
    <View style={styles.dock}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: colors.walletSurface, borderColor: colors.walletHairline, transform: [{ scale: pressed && !isReducedMotion ? 0.965 : 1 }] },
          ]}
        >
          <LinearGradient colors={action.fill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.iconWell, { shadowColor: action.glow, shadowOpacity: isDark ? 0.32 : 0.25 }]}>
            <Ionicons name={action.icon} size={23} color={action.tint} />
          </LinearGradient>
          <Text color={colors.text} weight="semiBold" numberOfLines={2} style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 14 },
  action: { alignItems: 'center', borderRadius: 20, borderWidth: 1, flex: 1, height: 92, justifyContent: 'center', gap: 7, minWidth: 0 },
  iconWell: { alignItems: 'center', borderRadius: 15, elevation: 4, height: 44, justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowRadius: 9, width: 44 },
  label: { fontSize: 12, lineHeight: 16, textAlign: 'center' },
});
