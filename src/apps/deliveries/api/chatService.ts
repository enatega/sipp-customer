import apiClient from '../../../general/api/apiClient';
import type {
  DeliveryChatBoxesResponse,
  DeliveryChatMessageRecord,
  DeliveryChatMessagesResponse,
  OrderChatUnreadCounts,
  SendDeliveryChatMessagePayload,
  SendDeliveryChatMessageResponse,
} from './chatServiceTypes';

const DELIVERIES_CHAT_BASE = '/api/v1/apps/deliveries/chat';

export const chatService = {
  getOrderUnreadCounts: () =>
    apiClient.get<OrderChatUnreadCounts>(`${DELIVERIES_CHAT_BASE}/order-unread`),
  getOrderChat: (orderId: string) =>
    apiClient.get<{ chatBoxId: string | null; messages: DeliveryChatMessageRecord[] }>(`${DELIVERIES_CHAT_BASE}/order/${orderId}/customer_rider`),

  markOrderChatRead: (orderId: string) =>
    apiClient.patch(`${DELIVERIES_CHAT_BASE}/order/${orderId}/customer_rider/read`),
  getChatBoxes: (userId: string) =>
    apiClient.get<DeliveryChatBoxesResponse>(
      `${DELIVERIES_CHAT_BASE}/${userId}`,
    ),

  getChatMessages: (chatBoxId: string) =>
    apiClient.get<DeliveryChatMessagesResponse>(
      `${DELIVERIES_CHAT_BASE}/messages/${chatBoxId}`,
    ),

  sendMessage: (payload: SendDeliveryChatMessagePayload) => {
    if (payload.orderId) {
      return apiClient.post<SendDeliveryChatMessageResponse>(
        `${DELIVERIES_CHAT_BASE}/order/${payload.orderId}/customer_rider/send`,
        { text: payload.text },
        { skipSessionExpiryHandling: true },
      );
    }

    return apiClient.post<SendDeliveryChatMessageResponse>(
      `${DELIVERIES_CHAT_BASE}/send`,
      payload,
      { skipSessionExpiryHandling: true },
    );
  },
};
