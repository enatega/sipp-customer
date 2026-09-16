import type { DeliverySearchRouteParams } from '../../navigation/sharedTypes';

export type ChainBottomTabParamList = {
  ChainTabHome: undefined;
  ChainTabSearch: DeliverySearchRouteParams | undefined;
  ChainTabOrders: undefined;
  ChainTabProfile: undefined;
};

export type ChainStackParamList = {
  ChainTabs: undefined;
  ChainDetails: undefined;
};
