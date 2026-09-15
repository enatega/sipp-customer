import React from 'react';
import type {
  ImageStyle,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { StyleSheet, View } from 'react-native';
import Image from '../Image';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import PressableScale from '../PressableScale';

type Props = {
  imageUrl?: string | null;
  title: string;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  imageWrapStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  variant?: 'default' | 'home';
};

export default function DiscoveryCategoryCard({
  imageUrl,
  title,
  onPress,
  containerStyle,
  imageWrapStyle,
  imageStyle,
  titleStyle,
  variant = 'default',
}: Props) {
  const { colors, elevation, shape, spacing } = useTheme();
  const isHomeVariant = variant === 'home';

  return (
    <PressableScale
      accessibilityLabel={title}
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      pressedScale={isHomeVariant ? 0.94 : undefined}
      style={[
        styles.container,
        isHomeVariant ? styles.homeContainer : null,
        {
          borderRadius: shape.radius.surface,
          gap: isHomeVariant ? spacing.xs + 2 : spacing.sm,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.imageWrap,
          isHomeVariant ? styles.homeImageWrap : elevation.raised,
          {
            backgroundColor: isHomeVariant ? 'transparent' : colors.surface,
            borderRadius: shape.radius.surface,
          },
          imageWrapStyle,
        ]}
      >
        <Image
          resizeMode={isHomeVariant ? 'contain' : 'cover'}
          source={imageUrl ? { uri: imageUrl } : undefined}
          style={[
            styles.image,
            isHomeVariant ? styles.homeImage : null,
            { borderRadius: shape.radius.control },
            imageStyle,
          ]}
        />
      </View>
      <Text
        variant="label"
        weight="semiBold"
        numberOfLines={2}
        style={[
          styles.title,
          isHomeVariant ? styles.homeTitle : null,
          { color: colors.textStrong },
          titleStyle,
        ]}
      >
        {title}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 96,
  },
  homeContainer: {
    width: 76,
  },
  homeImage: {
    height: 62,
    width: 62,
  },
  homeImageWrap: {
    height: 62,
    padding: 0,
    width: 72,
  },
  homeTitle: {
    fontSize: 12,
    lineHeight: 15,
    minHeight: 30,
  },
  image: {
    height: 64,
    width: 64,
  },
  imageWrap: {
    alignItems: 'center',
    height: 84,
    justifyContent: 'center',
    padding: 10,
    width: 84,
  },
  title: {
    textAlign: 'center',
  },
});
