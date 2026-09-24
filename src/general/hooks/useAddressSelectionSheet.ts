import { useCallback, useState } from 'react';

type Params = {
  addressesCount: number;
  isLoading: boolean;
};

// Note: this intentionally never auto-opens the sheet when addressesCount is
// 0. Having no saved address doesn't mean the user has no address — current
// location is resolved and auto-selected once location permission is
// granted (see the currentCoordinates hydration effect in the home
// screens), so forcing this sheet open here would just race/compete with
// that flow. The sheet only opens from explicit user action (open()).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function useAddressSelectionSheet(_params: Params) {
  const [isVisible, setIsVisible] = useState(false);

  const open = useCallback(() => {
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    close,
    isVisible,
    open,
  };
}