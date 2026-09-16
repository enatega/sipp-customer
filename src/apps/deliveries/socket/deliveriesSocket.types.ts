import type { SocketAck, SocketReceivedMessage, SocketSentMessage } from '../../../general/services/socket';
import type { DeliveryOrderEta, DeliveryOrderStatus } from '../api/ordersServiceTypes';

export type DeliveriesSocketAck<TResponse = unknown> = SocketAck<TResponse>;

export type DeliveriesClientEventMap = {
  'send-message': SocketSentMessage;
};

export type DeliveriesServerEventMap = {
  'get-rider-location': {
    customerUserId?: string;
    latitude?: number;
    longitude?: number;
    riderUserId?: string;
    eta?: DeliveryOrderEta | null;
  };
  'order-status-updated': {
    orderId?: string;
    riderId?: string | null;
    riderUserId?: string | null;
    riderStatus?: string | null;
    status?: DeliveryOrderStatus;
    updatedAt?: string;
    eta?: DeliveryOrderEta | null;
  };
  'rider-status-updated': {
    orderId?: string;
    riderStatus?: string | null;
    riderId?: string | null;
    riderName?: string | null;
    updatedAt?: string;
  };
  'receive-message': SocketReceivedMessage;
};

export type DeliveriesClientEventName = keyof DeliveriesClientEventMap;
export type DeliveriesServerEventName = keyof DeliveriesServerEventMap;
