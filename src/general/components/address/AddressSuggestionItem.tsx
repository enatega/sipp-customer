import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import Icon from '../../components/Icon';
import Text from '../../components/Text';
import PressableScale from '../../components/PressableScale';

type Props = {
  description: string;
  onPress: () => void;
  isRecent?: boolean;
};

function AddressSuggestionItem({ description, onPress, isRecent = false }: Props) {
  const { colors } = useTheme();

  const parts = description.split(',');
  const mainText = parts[0]?.trim() ?? description;
  const secondaryText = parts.slice(1).join(',').trim() || undefined;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={description}
      style={styles.row}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}> 
        <Icon
          type="Ionicons"
          name={isRecent ? 'time-outline' : 'location-outline'}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.textWrap}>
        <Text weight="medium" numberOfLines={1} style={styles.mainText}>
          {mainText}
        </Text>
        {secondaryText ? (
          <Text variant="caption" color={colors.mutedText} numberOfLines={1}>
            {secondaryText}
          </Text>
        ) : null}
      </View>
      <Icon type="Ionicons" name="chevron-forward" size={17} color={colors.iconMuted} />
    </PressableScale>
  );
}

export default memo(AddressSuggestionItem);

const styles = StyleSheet.create({
  iconCircle: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  mainText: {
    fontSize: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 8,
    minHeight: 62,
    borderRadius: 14,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
});
