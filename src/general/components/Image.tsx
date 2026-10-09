import React from 'react';
import { Image as RNImage, type ImageProps, type ImageResizeMode } from 'react-native';
import { Image as ExpoImage, type ImageContentFit, type ImageProps as ExpoImageProps } from 'expo-image';

const CONTENT_FIT_BY_RESIZE_MODE: Record<ImageResizeMode, ImageContentFit> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
  center: 'scale-down',
  repeat: 'cover',
  none: 'none',
};

function getRemoteUri(source: ImageProps['source']): string | null {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return null;
  }

  const { uri } = source as { uri?: unknown };
  return typeof uri === 'string' && /^https?:\/\//i.test(uri) ? uri : null;
}

// Remote images go through expo-image for its memory + disk cache, so logos,
// product photos and banners aren't re-downloaded after every cold start.
// Bundled assets stay on React Native's Image: it sizes itself from the
// asset's intrinsic dimensions, which expo-image does not, and those files are
// already on disk.
export default function Image(props: ImageProps) {
  const remoteUri = getRemoteUri(props.source);

  if (!remoteUri) {
    return <RNImage {...props} />;
  }

  const {
    source,
    style,
    resizeMode,
    fadeDuration,
    onError,
    onLoad: _onLoad,
    defaultSource: _defaultSource,
    loadingIndicatorSource: _loadingIndicatorSource,
    progressiveRenderingEnabled: _progressiveRenderingEnabled,
    ...rest
  } = props;

  return (
    <ExpoImage
      {...(rest as Partial<ExpoImageProps>)}
      source={source as ExpoImageProps['source']}
      style={style as ExpoImageProps['style']}
      contentFit={CONTENT_FIT_BY_RESIZE_MODE[resizeMode ?? 'cover']}
      transition={fadeDuration ?? null}
      cachePolicy="memory-disk"
      // Rows in recycled lists must not flash the previous row's image.
      recyclingKey={remoteUri}
      onError={onError ? () => onError(undefined as never) : undefined}
    />
  );
}
