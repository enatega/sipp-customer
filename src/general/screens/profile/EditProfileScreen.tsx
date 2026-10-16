import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useNavigation,
  useRoute,
  type NavigationProp,
  type RouteProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import { useTheme } from '../../theme/theme';
import { showToast } from '../../components/AppToast';
import {
  profileService,
  type ProfileAppPrefix,
  UpdateProfilePayload,
} from '../../api/profileService';
import EditProfileForm from '../../components/profile/EditProfileForm';
import type { ProfileStackParamList } from '../../navigation/profileTypes';
import useAndroidKeyboardVisible from '../../hooks/useAndroidKeyboardVisible';

function parseDob(iso: string | null) {
  if (!iso) return { day: '', month: '', year: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return {
    day: d.getDate().toString(),
    month: (d.getMonth() + 1).toString(),
    year: d.getFullYear().toString(),
  };
}

function buildDobString(day: string, month: string, year: string): string {
  if (!day || !month || !year) return '';
  const mm = month.padStart(2, '0');
  const dd = day.padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

type Props = {
  profilePrefix: ProfileAppPrefix;
};

export default function EditProfileScreen({ profilePrefix }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('general');
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'EditProfile'>>();
  const insets = useSafeAreaInsets();
  const isAndroidKeyboardVisible = useAndroidKeyboardVisible();

  const { name: initialName, dateOfBirth: initialDob, gender: initialGender } = route.params;
  const initialParsed = parseDob(initialDob);

  const [name, setName] = useState(initialName);
  const [dobDay, setDobDay] = useState(initialParsed.day);
  const [dobMonth, setDobMonth] = useState(initialParsed.month);
  const [dobYear, setDobYear] = useState(initialParsed.year);
  const [gender, setGender] = useState<string | null>(initialGender);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast.error(t('edit_profile_error'), t('edit_profile_name_required'));
      return;
    }

    const payload: UpdateProfilePayload = {};
    const newDob = buildDobString(dobDay, dobMonth, dobYear);
    const oldDob = buildDobString(initialParsed.day, initialParsed.month, initialParsed.year);
    if ((dobDay || dobMonth || dobYear) && !newDob) {
      showToast.error(t('edit_profile_error'), t('edit_profile_invalid_date'));
      return;
    }
    if (newDob) {
      const parsedDate = new Date(`${newDob}T00:00:00.000Z`);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== newDob || parsedDate.getTime() > Date.now()) {
        showToast.error(t('edit_profile_error'), t('edit_profile_invalid_date'));
        return;
      }
    }

    if (trimmedName !== initialName) payload.name = trimmedName;
    if (newDob && newDob !== oldDob) payload.dateOfBirth = newDob;
    if (gender !== initialGender) payload.gender = gender ?? undefined;

    if (Object.keys(payload).length === 0) {
      navigation.goBack();
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateProfile(profilePrefix, payload);
      showToast.success(t('edit_profile_success'), t('edit_profile_success_message'));
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('edit_profile_failed');
      showToast.error(t('edit_profile_error'), message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : isAndroidKeyboardVisible ? 'height' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title={t('edit_profile_title')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <EditProfileForm
          name={name}
          dobDay={dobDay}
          dobMonth={dobMonth}
          dobYear={dobYear}
          gender={gender}
          nameLabel={t('edit_profile_name')}
          dateOfBirthLabel={t('edit_profile_date_of_birth')}
          genderLabel={t('edit_profile_gender')}
          genderPlaceholder={t('edit_profile_gender_placeholder')}
          dayPlaceholder={t('edit_profile_day')}
          monthPlaceholder={t('edit_profile_month')}
          yearPlaceholder={t('edit_profile_year')}
          onNameChange={setName}
          onDobDayChange={setDobDay}
          onDobMonthChange={setDobMonth}
          onDobYearChange={setDobYear}
          onGenderChange={setGender}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Button
          label={t('edit_profile_save')}
          onPress={handleSave}
          isLoading={isSaving}
          disabled={isSaving}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  scrollView: { flex: 1 },
});
