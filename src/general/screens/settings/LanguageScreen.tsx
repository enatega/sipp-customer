import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import ScreenHeader from '../../components/ScreenHeader';
import Text from '../../components/Text';
import { useTheme } from '../../theme/theme';
import i18n, { type SupportedLanguage } from '../../localization/i18n';
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  LANGUAGE_LABEL_KEYS,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from '../../localization/supportedLanguages';
import { languageService } from '../../api/languageService';
import { languageKeys } from '../../api/queryKeys';
import { useAuthSessionQuery } from '../../hooks/useAuthQueries';

type LanguageOption = {
  code: SupportedLanguage;
  labelKey: string;
};

const LOCAL_LANGUAGE_OPTIONS: LanguageOption[] = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  labelKey: LANGUAGE_LABEL_KEYS[code],
}));

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation('general');
  const sessionQuery = useAuthSessionQuery();
  const [selected, setSelected] = useState<SupportedLanguage>(
    isSupportedLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE,
  );
  const [syncFailed, setSyncFailed] = useState(false);

  const languagesQuery = useQuery({
    queryKey: languageKeys.available(),
    queryFn: ({ signal }) => languageService.getAvailableLanguages(signal),
    staleTime: 5 * 60 * 1000,
  });

  const updatePreferenceMutation = useMutation({
    mutationFn: languageService.updateCustomerLanguage,
  });

  const languageOptions = useMemo(() => {
    if (!languagesQuery.data) {
      const safeCodes = new Set<SupportedLanguage>([DEFAULT_LANGUAGE, selected]);
      return LOCAL_LANGUAGE_OPTIONS.filter((option) => safeCodes.has(option.code));
    }

    const activeCodes = new Set(
      languagesQuery.data
        .map((language) => language.code.trim().toLowerCase().split('-')[0])
        .filter(isSupportedLanguage),
    );
    activeCodes.add(DEFAULT_LANGUAGE);

    return LOCAL_LANGUAGE_OPTIONS.filter((option) => activeCodes.has(option.code));
  }, [languagesQuery.data, selected]);

  useEffect(() => {
    if (!languagesQuery.data || languageOptions.some((option) => option.code === selected)) {
      return;
    }

    setSelected(DEFAULT_LANGUAGE);
    void i18n.changeLanguage(DEFAULT_LANGUAGE);
    void SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
  }, [languageOptions, languagesQuery.data, selected]);

  const handleSelect = useCallback(async (code: SupportedLanguage) => {
    if (code === selected || updatePreferenceMutation.isPending) {
      return;
    }

    setSyncFailed(false);
    setSelected(code);
    await i18n.changeLanguage(code);
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, code);

    if (sessionQuery.data?.token) {
      try {
        await updatePreferenceMutation.mutateAsync(code);
      } catch {
        setSyncFailed(true);
      }
    }
  }, [selected, sessionQuery.data?.token, updatePreferenceMutation]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t('language_title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="subtitle" weight="bold" color={colors.text} style={styles.sectionLabel}>
          {t('language_section_label')}
        </Text>

        {languagesQuery.isPending ? (
          <View style={styles.loadingState} accessibilityRole="progressbar">
            <ActivityIndicator color={colors.primary} />
            <Text variant="body" color={colors.mutedText}>
              {t('language_loading')}
            </Text>
          </View>
        ) : null}

        {languagesQuery.isError ? (
          <View style={[styles.notice, { borderColor: colors.border }]}>
            <Text variant="body" color={colors.mutedText} style={styles.noticeText}>
              {t('language_load_error')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { void languagesQuery.refetch(); }}
              style={({ pressed }) => [styles.retryButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Text variant="body" weight="bold" color={colors.primary}>
                {t('generic_list_retry')}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={[styles.optionList, { borderColor: colors.border }]}>
          {languageOptions.map((option, index) => {
            const isSelected = selected === option.code;
            const isLast = index === languageOptions.length - 1;

            return (
              <Pressable
                key={option.code}
                onPress={() => { void handleSelect(option.code); }}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected, disabled: updatePreferenceMutation.isPending }}
                accessibilityLabel={t(option.labelKey)}
                disabled={updatePreferenceMutation.isPending}
                style={({ pressed }) => [
                  styles.option,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text variant="body" color={colors.text}>
                  {t(option.labelKey)}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>

        {syncFailed ? (
          <Text variant="caption" color={colors.dangerText} style={styles.syncError}>
            {t('language_sync_error')}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionList: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  loadingState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  notice: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noticeText: { flex: 1 },
  retryButton: { paddingHorizontal: 4, paddingVertical: 6 },
  screen: { flex: 1 },
  scrollView: { flex: 1 },
  sectionLabel: {
    marginTop: 4,
  },
  syncError: { marginTop: 10 },
});
