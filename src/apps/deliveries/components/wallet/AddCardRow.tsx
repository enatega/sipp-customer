import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  label: string;
  onPress: () => void;
};

export default function AddCardRow({ label, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { backgroundColor: colors.walletSurfaceAlt, opacity: pressed ? 0.72 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="add" size={21} color={colors.walletBlue} />
      </View>
      <Text weight="medium" color={colors.walletBlue} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    gap: 8,
    height: 56,
    marginTop: 6,
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 28,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
