import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { WebView } from 'react-native-webview';
import ScreenHeader from './ScreenHeader';
import { useTheme } from '../theme/theme';

type Props = {
  onBackPress: () => void;
  onShouldStartLoad?: (navigation: WebViewNavigation) => boolean;
  onLoadError?: () => void;
  sourceUrl: string;
  title: string;
};

export default function AppWebView({
  onBackPress,
  onShouldStartLoad,
  onLoadError,
  sourceUrl,
  title,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader
        onBack={onBackPress}
        title={title}
        variant="close"
      />

      <WebView
        originWhitelist={['*']}
        source={{ uri: sourceUrl }}
        style={styles.webview}
        onShouldStartLoadWithRequest={onShouldStartLoad}
        onError={onLoadError}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
