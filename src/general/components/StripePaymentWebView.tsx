import React from 'react';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import AppWebView from './AppWebView';

type Props = {
  cancelUrlMatcher: string;
  checkoutUrl: string;
  onBackPress: () => void;
  onPaymentCancel?: (url: string) => void;
  onPaymentFailure?: (url: string) => void;
  onPaymentSuccess: (url: string) => void;
  onUrlChange?: (url: string) => void;
  successUrlMatcher: string;
  title: string;
};

function stripQueryAndHash(url: string) {
  return url.split(/[?#]/)[0].replace(/\/+$/, '').toLowerCase();
}

// Absolute matchers must equal the URL's origin + path; path matchers must end
// the URL's path. Query and hash are ignored (the backend may append a session
// id), so a matcher appearing only in a query string never counts.
function matchesReturnUrl(url: string, matcher: string) {
  const normalizedUrl = stripQueryAndHash(url);
  const normalizedMatcher = stripQueryAndHash(matcher);

  if (/^https?:\/\//i.test(matcher)) {
    return normalizedUrl === normalizedMatcher;
  }

  return normalizedUrl.endsWith(normalizedMatcher);
}

export default function StripePaymentWebView({
  cancelUrlMatcher,
  checkoutUrl,
  onBackPress,
  onPaymentCancel,
  onPaymentFailure,
  onPaymentSuccess,
  onUrlChange,
  successUrlMatcher,
  title,
}: Props) {
  const hasResolvedRef = React.useRef(false);

  const handleShouldStartLoad = React.useCallback((navigation: WebViewNavigation) => {
    const { url } = navigation;

    onUrlChange?.(url);

    if (matchesReturnUrl(url, successUrlMatcher)) {
      if (!hasResolvedRef.current) {
        hasResolvedRef.current = true;
        onPaymentSuccess(url);
      }

      return false;
    }

    if (matchesReturnUrl(url, cancelUrlMatcher)) {
      if (!hasResolvedRef.current) {
        hasResolvedRef.current = true;

        if (onPaymentCancel) {
          onPaymentCancel(url);
        } else {
          onPaymentFailure?.(url);
        }
      }

      return false;
    }

    return true;
  }, [
    cancelUrlMatcher,
    onPaymentCancel,
    onPaymentFailure,
    onPaymentSuccess,
    onUrlChange,
    successUrlMatcher,
  ]);

  return (
    <AppWebView
      onBackPress={onBackPress}
      onShouldStartLoad={handleShouldStartLoad}
      sourceUrl={checkoutUrl}
      title={title}
    />
  );
}
