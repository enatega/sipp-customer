import React from 'react';
import { StyleSheet } from 'react-native';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  title: string;
};

export default function CategorySeeAllGridListHeader({ title }: Props) {
  const { colors } = useTheme();

  return (
    <Text
      accessibilityRole="header"
      variant="sectionTitle"
      weight="bold"
      style={[
        styles.title,
        {
          color: colors.text,
        },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 18,
  },
});
