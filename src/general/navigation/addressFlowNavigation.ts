import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  AddressFlowHostParamList,
  AddressFlowOrigin,
} from './addressFlowTypes';

export function navigateAfterAddressSelection(
  navigation: NativeStackNavigationProp<AddressFlowHostParamList>,
  origin?: AddressFlowOrigin,
) {
  if (origin === 'multi-vendor-home') {
    navigation.navigate('MultiVendor', { screen: 'MultiVendorTabs' });
    return;
  }

  if (origin === 'single-vendor-home') {
    navigation.navigate('SingleVendor', { screen: 'SingleVendorTabs' });
    return;
  }

  if (origin === 'chain-home') {
    navigation.navigate('Chain', { screen: 'ChainTabs' });
    return;
  }

  if (origin === 'checkout') {
    navigation.navigate('Checkout');
    return;
  }

  navigation.navigate('MyProfile');
}
