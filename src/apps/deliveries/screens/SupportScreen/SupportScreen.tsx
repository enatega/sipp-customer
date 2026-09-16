import React, { useMemo } from 'react';
import { Linking } from 'react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import SupportChatFooter from '../../../../general/components/support/SupportChatFooter';
import SupportIssueDropdown from '../../../../general/components/support/SupportIssueDropdown';
import SupportHeader from '../../../../general/components/support/SupportHeader';
import SupportTopicItem from '../../../../general/components/support/SupportTopicItem';
import Text from '../../../../general/components/Text';
import { showToast } from '../../../../general/components/AppToast';
import { useAuthSessionQuery } from '../../../../general/hooks/useAuthQueries';
import { useTheme } from '../../../../general/theme/theme';
import { DELIVERIES_SUPPORT_PHONE_NUMBER } from '../../constants/support';
import SupportActiveOrderCard from '../../components/support/SupportActiveOrderCard';
import { getOrderStatusPresentation } from '../../components/orders/orderPresentation';
import { useActiveOrders } from '../../hooks/useOrders';
import { useSupportTicketFormConfigQuery } from '../../hooks/useSupportTicketFormConfigQuery';
import type { DeliveriesStackParamList } from '../../navigation/types';
import { buildSupportOptions, orderSupportCategoryKeys } from '../../utils/supportFormOptions';

export default function SupportScreen() {
  const { colors, elevation, shape, spacing, typography } = useTheme();
  const { t, i18n } = useTranslation('deliveries');
  const navigation = useNavigation<NativeStackNavigationProp<DeliveriesStackParamList>>();
  const sessionQuery = useAuthSessionQuery();
  const activeOrdersQuery = useActiveOrders({ limit: 1 });
  const supportTicketFormConfigQuery = useSupportTicketFormConfigQuery();
  const displayName = sessionQuery.data?.user?.name ?? t('support_guest_name');
  const activeOrder = activeOrdersQuery.data?.pages[0]?.items[0];
  const activeOrderStatus = activeOrder
    ? getOrderStatusPresentation(activeOrder.orderStatus, t)
    : undefined;
  const handleCallSupport = async () => {
    try {
      await Linking.openURL(`tel:${DELIVERIES_SUPPORT_PHONE_NUMBER}`);
    } catch {
      showToast.error(t('support_call_action'));
    }
  };
  const issueOptions = useMemo(
    () => {
      const categoryKeys = orderSupportCategoryKeys(
        supportTicketFormConfigQuery.data?.categories.map((category) => category.key) ?? [
          'business_support',
          'joining_as_a_business',
          'appointment_support',
        ],
      );

      return buildSupportOptions(
        categoryKeys,
        'support_issue_',
        t,
        (key) => i18n.exists(key, { ns: 'deliveries' }),
      );
    },
    [i18n, supportTicketFormConfigQuery.data?.categories, t],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SupportHeader
        backAccessibilityLabel={t('support_back_action')}
        onRightPress={() => {
          void handleCallSupport();
        }}
        rightAccessibilityLabel={t('support_call_action')}
        title={t('support_title')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          color={colors.mutedText}
          weight="medium"
          style={[styles.greeting, { fontSize: typography.size.sm2, lineHeight: typography.lineHeight.md }]}
        >
          {t('support_greeting', { name: displayName })}
        </Text>

        <Text
          color={colors.text}
          variant="title"
          weight="extraBold"
          style={styles.headline}
        >
          {t('support_headline')}
        </Text>

        {activeOrder && activeOrderStatus ? (
          <View style={styles.section}>
            <Text
              accessibilityRole="header"
              color={colors.textStrong}
              variant="sectionTitle"
              weight="bold"
            >
              {t('support_active_order_title')}
            </Text>
            <SupportActiveOrderCard
              accessibilityLabel={t('support_active_order_accessibility', {
                status: activeOrderStatus.label,
                store: activeOrder.storeName,
              })}
              actionLabel={t('support_active_order_track')}
              eyebrow={t('support_active_order_eyebrow')}
              imageUri={activeOrder.storeImage ?? activeOrder.storeLogo ?? undefined}
              onPress={() => navigation.navigate('OrderTrackingScreen', { orderId: activeOrder.orderId })}
              statusLabel={activeOrderStatus.label}
              statusTone={activeOrderStatus.tone}
              storeName={activeOrder.storeName}
            />
          </View>
        ) : null}

        <View
          style={[
            styles.chatCard,
            elevation.subtle,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border,
              borderRadius: shape.radius.hero,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.chatCopy}>
            <Text color={colors.textStrong} variant="cardTitle" weight="bold">
              {t('support_chat_now_title')}
            </Text>
            <Text color={colors.textSubtle} variant="supporting">
              {t('support_chat_now_description')}
            </Text>
          </View>
          <SupportTopicItem
            description={t('support_chat_now_action_description')}
            iconName="chatbubble-ellipses-outline"
            label={t('support_chat_cta')}
            onPress={() => navigation.navigate('SupportChat', { agentName: t('support_chat_agent_name') })}
          />
        </View>

        <View style={styles.section}>
          <Text
            color={colors.text}
            weight="extraBold"
            style={[styles.sectionTitle, { fontSize: typography.size.lg, lineHeight: 22 }]}
          >
            {t('support_browse_topics')}
          </Text>

          <SupportTopicItem
            iconName="chatbox-outline"
            label={t('support_topic_conversations')}
            description={t('support_topic_conversations_description')}
            onPress={() => navigation.navigate('SupportConversations')}
          />
          <SupportTopicItem
            iconName="alert-circle-outline"
            label={t('support_topic_tickets')}
            description={t('support_topic_tickets_description')}
            onPress={() => navigation.navigate('SupportTickets')}
          />
          <SupportTopicItem
            iconName="help-circle-outline"
            label={t('support_topic_faq')}
            description={t('support_topic_faq_description')}
            onPress={() => navigation.navigate('SupportFaq')}
          />
        </View>

        <View style={styles.section}>
          <Text
            color={colors.text}
            weight="extraBold"
            style={[styles.sectionTitle, { fontSize: typography.size.lg, lineHeight: 22 }]}
          >
            {t('support_issue_prompt')}
          </Text>

          <SupportIssueDropdown
            options={issueOptions}
            placeholder={t('support_issue_placeholder')}
            sheetTitle={t('support_issue_select_title')}
            value={undefined}
            onChange={(nextValue) => {
              const selectedOption = issueOptions.find((option) => option.value === nextValue);

              if (!selectedOption) {
                return;
              }

              navigation.navigate('SupportContactForm', {
                issueLabel: selectedOption.label,
                issueValue: selectedOption.value,
              });
            }}
          />
        </View>
      </ScrollView>

      <SupportChatFooter
        ctaLabel={t('support_report_issue_cta')}
        iconName="alert-circle-outline"
        onPress={() => {
          const selectedOption = issueOptions.find((option) => option.value === 'appointment_support')
            ?? issueOptions[0];

          if (selectedOption) {
            navigation.navigate('SupportContactForm', {
              issueLabel: selectedOption.label,
              issueValue: selectedOption.value,
            });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  chatCard: {
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 28,
  },
  chatCopy: {
    gap: 6,
    marginBottom: 8,
  },
  greeting: {
    marginBottom: 8,
  },
  headline: {
    marginBottom: 24,
    maxWidth: 360,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  section: {
    gap: 10,
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 4,
  },
});
