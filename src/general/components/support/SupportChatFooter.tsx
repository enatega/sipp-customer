import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../Button';
import { useTheme } from '../../theme/theme';

type Props = {
  ctaLabel: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function SupportChatFooter({ ctaLabel, iconName = 'chatbubble-ellipses-outline', onPress }: Props) {
  const { colors, shape } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <Button
        icon={<Ionicons name={iconName} size={22} color={colors.onPrimary} />}
        label={ctaLabel}
        onPress={onPress}
        style={[styles.footerButton, { borderRadius: shape.radius.control }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  footerButton: {
    minHeight: 52,
  },
});
