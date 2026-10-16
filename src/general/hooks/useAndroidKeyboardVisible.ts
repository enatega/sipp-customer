import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export default function useAndroidKeyboardVisible() {
  const [isVisible, setIsVisible] = useState(
    Platform.OS === 'android' && Keyboard.isVisible(),
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const show = Keyboard.addListener('keyboardDidShow', () => setIsVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setIsVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return isVisible;
}
