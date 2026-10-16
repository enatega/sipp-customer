import * as SecureStore from 'expo-secure-store';

export type CheckoutAttempt = {
  userId: string;
  bucketId: string;
  storeId: string;
  draftId?: string;
  checkoutUrl?: string;
  createdAt: string;
};

const keyFor = (userId: string) => `deliveries_checkout_attempt_${userId}`;

export const checkoutAttemptStorage = {
  async read(userId: string): Promise<CheckoutAttempt | null> {
    const raw = await SecureStore.getItemAsync(keyFor(userId));
    if (!raw) return null;
    try {
      const attempt = JSON.parse(raw) as CheckoutAttempt;
      return attempt.userId === userId && attempt.bucketId && attempt.storeId ? attempt : null;
    } catch {
      return null;
    }
  },
  async save(attempt: CheckoutAttempt): Promise<void> {
    await SecureStore.setItemAsync(keyFor(attempt.userId), JSON.stringify(attempt));
  },
  async clear(userId: string): Promise<void> {
    await SecureStore.deleteItemAsync(keyFor(userId));
  },
};
