import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/theme';
import Text from '../Text';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function ProfileMenuSection({ children, title }: Props) {
  const { colors, elevation } = useTheme();
  const items = React.Children.toArray(children);

  return (
    <View style={styles.wrapper}>
      {title ? (
        <Text weight="bold" style={styles.title}>
          {title}
        </Text>
      ) : null}
      <View style={[styles.surface, elevation.subtle, { backgroundColor: colors.surface }]}> 
        <View style={[styles.container, { borderColor: colors.divider }]}> 
          {items.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < items.length - 1 && (
                <View style={styles.dividerWrapper}>
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
  },
  dividerWrapper: {
    paddingVertical: 4,
  },
  wrapper: {
    gap: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
    paddingHorizontal: 2,
  },
  surface: {
    borderRadius: 18,
  },
});
