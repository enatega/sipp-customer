import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';

type Props = {
  videoUri: string;
};

export default function SpecialOffersBannerVideo({ videoUri }: Props) {
  const isReducedMotionEnabled = useReducedMotion();
  const player = useVideoPlayer({ uri: videoUri }, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  useEffect(() => {
    if (isReducedMotionEnabled) {
      player.pause();
      return;
    }

    player.play();
  }, [isReducedMotionEnabled, player]);

  return (
    <VideoView
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      contentFit="cover"
      nativeControls={false}
      player={player}
      style={styles.video}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
});
