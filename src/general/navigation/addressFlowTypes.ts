import { ProfileAppPrefix } from "../api/profileService";
import type { AddressAdditionalFields } from '../api/addressService';

export type AddressFlowOrigin =
  | 'multi-vendor-home'
  | 'profile'
  | 'single-vendor-home'
  | 'chain-home'
  | 'checkout';

export type AddressFlowParams = {
  appPrefix: ProfileAppPrefix;
  editAddressId?: string;
  editType?: string;
  editLocationName?: string;
  editAdditionalFields?: AddressAdditionalFields;
  editAddressDetails?: import("../api/addressService").AddressDetails | null;
  expectedUpdatedAt?: string;
  draftDetails?: import("../api/addressService").AddressDetails;
  draftType?: import("../api/addressService").AddressType;
  initialLatitude?: number;
  initialLongitude?: number;
  origin?: AddressFlowOrigin;
  preselectAsDefault?: boolean;
};

export type AddressDetailParams = {
  address: string;
  latitude: number;
  longitude: number;
  appPrefix: ProfileAppPrefix;
  editAddressId?: string;
  editType?: string;
  editLocationName?: string;
  editAdditionalFields?: AddressAdditionalFields;
  editAddressDetails?: import("../api/addressService").AddressDetails | null;
  expectedUpdatedAt?: string;
  draftDetails?: import("../api/addressService").AddressDetails;
  draftType?: import("../api/addressService").AddressType;
  origin?: AddressFlowOrigin;
  preselectAsDefault?: boolean;
};

export type AddressFlowParamList = {
  AddressSearch: AddressFlowParams;
  AddressChooseOnMap: AddressFlowParams;
  AddressDetail: AddressDetailParams;
};

export type AddressFlowHostParamList = AddressFlowParamList & {
  Checkout: undefined;
  Chain: { screen: 'ChainTabs' } | undefined;
  MultiVendor: { screen: 'MultiVendorTabs' } | undefined;
  MyProfile: undefined;
  SingleVendor: { screen: 'SingleVendorTabs' } | undefined;
};
