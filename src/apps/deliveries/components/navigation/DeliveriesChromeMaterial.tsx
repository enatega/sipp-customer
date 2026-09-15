import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function DeliveriesChromeMaterial({ children, style }: Props) {
  return (
    <PlatformGlassSurface style={style}>
      {children}
    </PlatformGlassSurface>
  );
}
