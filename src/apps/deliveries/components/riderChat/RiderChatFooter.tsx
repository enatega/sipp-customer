import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../../../general/theme/theme';
import RiderChatComposer from './RiderChatComposer';

type Props = {
  bottomInset: number;
  isKeyboardVisible: boolean;
  isSending?: boolean;
  onChangeText: (value: string) => void;
  onAttachmentPress: () => void;
  onSend: () => void;
  placeholder: string;
  value: string;
};

export default function RiderChatFooter({
  bottomInset,
  isKeyboardVisible,
  isSending = false,
  onChangeText,
  onAttachmentPress,
  onSend,
  placeholder,
  value,
}: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: isKeyboardVisible ? 4 : Math.max(bottomInset, 12),
        },
      ]}
    >
      <RiderChatComposer
        isSending={isSending}
        value={value}
        onChangeText={onChangeText}
        onAttachmentPress={onAttachmentPress}
        onSend={onSend}
        placeholder={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
