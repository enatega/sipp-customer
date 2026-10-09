import React from 'react';
import { StyleSheet, View } from 'react-native';
import Image from '../Image';
import Text from '../Text';
import { useTheme } from '../../theme/theme';

type Props = {
  isCurrentUser?: boolean;
  text: string;
  attachmentUrls?: string[];
  photoAccessibilityLabel?: string;
  timeLabel?: string;
};

export default function ChatMessageBubble({ isCurrentUser = false, text, attachmentUrls = [], photoAccessibilityLabel, timeLabel }: Props) {
  const { colors, isDark, typography } = useTheme();

  return (
    <View style={[styles.wrapper, isCurrentUser ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isCurrentUser ? (isDark ? colors.cardSoft : colors.primary) : colors.backgroundTertiary,
            borderColor: isCurrentUser ? (isDark ? colors.border : colors.primary) : 'transparent',
          },
        ]}
      >
        {attachmentUrls.map((url) => (
          <Image key={url} source={{ uri: url }} style={styles.photo} accessibilityLabel={photoAccessibilityLabel} />
        ))}
        {text ? <Text
          color={isCurrentUser ? (isDark ? colors.text : colors.onPrimary) : colors.text}
          style={{ fontSize: typography.size.sm2, lineHeight: typography.lineHeight.md }}
        >
          {text}
        </Text> : null}
      </View>
      {timeLabel ? (
        <Text color={colors.mutedText} style={[styles.timeLabel, { fontSize: typography.size.xs2, lineHeight: typography.lineHeight.sm }]}>
          {timeLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  photo: {
    borderRadius: 8,
    height: 180,
    width: 180,
  },
  rowLeft: {
    alignItems: 'flex-start',
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  timeLabel: {
    marginTop: 6,
  },
  wrapper: {
    gap: 0,
  },
});
