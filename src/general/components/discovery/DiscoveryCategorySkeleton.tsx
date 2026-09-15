import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../Skeleton';

type Props = {
  variant?: 'default' | 'home';
};

function Card({ variant = 'default' }: Props) {
  const isHomeVariant = variant === 'home';
  const imageWrap = isHomeVariant ? styles.homeImageWrap : styles.imageWrap;
  const image = isHomeVariant ? styles.homeImage : styles.image;

  return (
    <View style={[styles.card, isHomeVariant ? styles.homeCard : null]}>
      <Skeleton
        width={imageWrap.width}
        height={imageWrap.height}
        borderRadius={imageWrap.borderRadius}
      >
        <View style={[styles.imageContainer, isHomeVariant ? styles.homeImageContainer : null]}>
          <Skeleton
            width={image.width}
            height={image.height}
            borderRadius={image.borderRadius}
          />
        </View>
      </Skeleton>

      <Skeleton width={isHomeVariant ? 58 : 80} height={14} borderRadius={6} />
    </View>
  );
}

export default function DiscoveryCategorySkeleton({ variant = 'default' }: Props) {
  return (
    <View style={[styles.container, variant === 'home' ? styles.homeContainer : null]}>
      <Card variant={variant} />
      <Card variant={variant} />
      <Card variant={variant} />
      {variant === 'home' ? (
        <>
          <Card variant={variant} />
          <Card variant={variant} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
    width: 96,
  },
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  homeCard: {
    gap: 6,
    width: 76,
  },
  homeContainer: {
    gap: 4,
  },
  homeImage: {
    borderRadius: 12,
    height: 56,
    width: 56,
  },
  homeImageContainer: {
    padding: 3,
  },
  homeImageWrap: {
    borderRadius: 16,
    height: 62,
    width: 72,
  },
  image: {
    borderRadius: 12,
    height: 64,
    width: 64,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  imageWrap: {
    borderRadius: 16,
    height: 84,
    width: 84,
  },
});
