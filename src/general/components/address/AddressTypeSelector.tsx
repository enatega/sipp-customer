import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../../components/Text';
import { useTheme } from '../../theme/theme';
import type { AddressType } from '../../api/addressService';
import PressableScale from '../../components/PressableScale';

type Props = {
  selected: AddressType;
  onSelect: (type: AddressType) => void;
  labels: {
    home: string;
    apartment: string;
    office: string;
    other: string;
  };
};

const OPTIONS: Array<{
  value: AddressType;
  icon: keyof typeof Ionicons.glyphMap;
  key: keyof Props['labels'];
}> = [
  { value: 'HOME', icon: 'home-outline', key: 'home' },
  { value: 'APARTMENT', icon: 'business-outline', key: 'apartment' },
  { value: 'OFFICE', icon: 'briefcase-outline', key: 'office' },
  { value: 'OTHER', icon: 'location-outline', key: 'other' },
];

function AddressTypeSelector({ selected, onSelect, labels }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {OPTIONS.map((option) => {
        const isSelected = selected === option.value;

        return (
          <PressableScale
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={labels[option.key]}
            onPress={() => onSelect(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={19}
              color={isSelected ? colors.primary : colors.iconMuted}
            />
            <Text
              weight={isSelected ? 'bold' : 'medium'}
              color={isSelected ? colors.primary : colors.text}
              numberOfLines={1}
              style={styles.optionText}
            >
              {labels[option.key]}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default memo(AddressTypeSelector);

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    overflow: 'hidden',
    paddingHorizontal: 12,
  },
  optionText: { flex: 1, fontSize: 13, lineHeight: 18 },
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 16,
  },
});
