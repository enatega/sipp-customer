import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import SupportChatFooter from '../../../../general/components/support/SupportChatFooter';
import SupportFaqListItem from '../../../../general/components/support/SupportFaqListItem';
import SupportHeader from '../../../../general/components/support/SupportHeader';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';
import { SupportFaqNavigationProp } from '../../navigation/supportNavigationTypes';
import { supportFaqArticles } from '../../utils/supportFaqArticles';

export default function SupportFaqScreen() {
  const { colors, shape, spacing, typography } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<SupportFaqNavigationProp>();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SupportHeader
        backAccessibilityLabel={t('support_back_action')}
        rightAccessibilityLabel={t('support_header_action')}
        title={t('support_faq_header_title')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          color={colors.text}
          weight="extraBold"
          style={[styles.title, { fontSize: typography.size.h5, lineHeight: 38 }]}
        >
          {t('support_faq_title')}
        </Text>
        <Text
          color={colors.textSubtle}
          style={[styles.subtitle, { fontSize: typography.size.sm2, lineHeight: typography.lineHeight.md }]}
        >
          {t('support_faq_subtitle')}
        </Text>

        <View
          style={[
            styles.list,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: shape.radius.hero,
              paddingHorizontal: spacing.lg,
            },
          ]}
        >
          {supportFaqArticles.map((item) => (
            <SupportFaqListItem
              key={item.id}
              label={t(item.titleKey)}
              onPress={() => navigation.navigate('SupportFaqArticle', { articleId: item.id })}
            />
          ))}
        </View>
      </ScrollView>

      <SupportChatFooter
        ctaLabel={t('support_chat_cta')}
        onPress={() => navigation.navigate('SupportChat', { agentName: t('support_chat_agent_name') })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  list: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 16,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
    maxWidth: 340,
  },
  subtitle: {
    marginBottom: 20,
    maxWidth: 420,
  },
});
