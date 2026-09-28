import React from 'react';
import { useTranslation } from 'react-i18next';
import ChatComposer from '../chat/ChatComposer';

type Props = {
  isSending?: boolean;
  onChangeText: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  value: string;
};

export default function RiderChatComposer({
  isSending = false,
  onChangeText,
  onSend,
  placeholder,
  value,
}: Props) {
  const { t } = useTranslation('deliveries');

  return (
    <ChatComposer
      attachmentAccessibilityLabel={t('rider_chat_add_attachment')}
      isSending={isSending}
      messageAccessibilityLabel={t('rider_chat_send_message')}
      showAttachment={false}
      onChangeText={onChangeText}
      onSend={onSend}
      placeholder={placeholder}
      value={value}
    />
  );
}
