import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../../general/components/Button';
import ListStateView from '../../../../general/components/filterablePaginatedList/ListStateView';
import PressableScale from '../../../../general/components/PressableScale';
import Surface from '../../../../general/components/Surface';
import TabSwitcher from '../../../../general/components/TabSwitcher';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';
import { useCheckoutSchedule } from '../../hooks';
import CheckoutHeader from './CheckoutHeader';
import {
  buildCheckoutScheduleDayOptions,
  buildCheckoutScheduleSlots,
  findCheckoutScheduleDayKey,
  type CheckoutScheduleDayKey,
} from './checkoutScheduleUtils';

type Props = {
  onBackPress: () => void;
  onConfirm: (scheduledAt: string) => void;
  selectedScheduledAt?: string | null;
  storeId: string | null;
};

export default function CheckoutScheduleScreen({
  onBackPress,
  onConfirm,
  selectedScheduledAt,
  storeId,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const { gutter } = useWindowClass();
  const scheduleInput = React.useMemo(
    () => ({
      dateTime: new Date().toISOString(),
      days: 2,
      slotMinutes: 60,
    }),
    [selectedScheduledAt],
  );
  const { data: schedule, isError, isPending, refetch } = useCheckoutSchedule(storeId, scheduleInput);
  const [selectedDayKey, setSelectedDayKey] = React.useState<CheckoutScheduleDayKey | null>(
    findCheckoutScheduleDayKey(schedule, selectedScheduledAt),
  );

  React.useEffect(() => {
    const nextDayKey = findCheckoutScheduleDayKey(schedule, selectedScheduledAt);
    setSelectedDayKey((currentValue) => {
      if (currentValue && schedule?.days.some((day) => day.date === currentValue)) {
        return currentValue;
      }
      return nextDayKey;
    });
  }, [schedule, selectedScheduledAt]);

  const dayOptions = React.useMemo(
    () => buildCheckoutScheduleDayOptions(schedule, {
      today: t('checkout_schedule_today'),
      tomorrow: t('checkout_schedule_tomorrow'),
    }),
    [schedule, t],
  );
  const slots = React.useMemo(
    () => selectedDayKey ? buildCheckoutScheduleSlots(schedule, selectedDayKey) : [],
    [schedule, selectedDayKey],
  );
  const [selectedScheduledSlot, setSelectedScheduledSlot] = React.useState<string | null>(
    selectedScheduledAt ?? null,
  );

  React.useEffect(() => {
    setSelectedScheduledSlot((currentValue) => {
      if (currentValue && slots.some((slot) => slot.scheduledAt === currentValue)) {
        return currentValue;
      }
      return slots[0]?.scheduledAt ?? null;
    });
  }, [slots]);

  const isConfirmDisabled = !selectedScheduledSlot || isPending || !schedule?.allowScheduleBooking;

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <CheckoutHeader onBackPress={onBackPress} title={t('checkout_schedule_title')} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            gap: spacing.section.default,
            paddingBottom: 120,
            paddingHorizontal: gutter,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentInner, { gap: spacing.section.default, maxWidth: layout.contentMaxWidth.readable }]}>
          <Surface style={[styles.intro, { backgroundColor: colors.primarySoft, gap: spacing.md, padding: spacing.lg }]}>
            <View style={[styles.introIcon, { backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.pill }]}>
              <Ionicons color={colors.primary} name="time-outline" size={23} />
            </View>
            <View style={styles.introCopy}>
              <Text variant="cardTitle" weight="bold">
                {t('checkout_schedule_heading')}
              </Text>
              <Text color={colors.textSubtle} variant="supporting">
                {t('checkout_schedule_description')}
              </Text>
            </View>
          </Surface>

          {isPending ? (
            <ListStateView containerStyle={styles.stateBlock} variant="loading" />
          ) : isError ? (
            <ListStateView
              actionLabel={t('generic_list_retry')}
              containerStyle={styles.stateBlock}
              description={t('checkout_schedule_error_message')}
              onActionPress={() => void refetch()}
              title={t('checkout_schedule_error_title')}
              variant="error"
            />
          ) : !schedule?.allowScheduleBooking || dayOptions.length === 0 ? (
            <ListStateView
              containerStyle={styles.stateBlock}
              description={t('checkout_schedule_empty_message')}
              title={t('checkout_schedule_empty_title')}
              variant="empty"
            />
          ) : (
            <>
              <TabSwitcher
                activeKey={selectedDayKey ?? dayOptions[0]?.key ?? ''}
                onChange={(key) => setSelectedDayKey(key as CheckoutScheduleDayKey)}
                tabs={dayOptions.map((option) => ({
                  disabled: !option.hasSlots,
                  key: option.key,
                  label: option.label,
                }))}
              />

              {slots.length === 0 ? (
                <ListStateView
                  containerStyle={styles.stateBlock}
                  description={t('checkout_schedule_empty_message')}
                  title={t('checkout_schedule_empty_title')}
                  variant="empty"
                />
              ) : (
                <View style={[styles.slotSection, { gap: spacing.md }]}>
                  <Text accessibilityRole="header" variant="sectionTitle" weight="bold">
                    {t('checkout_schedule_available_times')}
                  </Text>
                  <View style={[styles.slotList, { gap: spacing.sm }]}>
                    {slots.map((slot) => {
                      const isSelected = slot.scheduledAt === selectedScheduledSlot;
                      return (
                        <PressableScale
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isSelected }}
                          key={slot.id}
                          onPress={() => setSelectedScheduledSlot(slot.scheduledAt)}
                          style={[
                            styles.slotButton,
                            {
                              backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.border,
                              borderRadius: shape.radius.control,
                              minHeight: layout.touchTarget.comfortable,
                              paddingHorizontal: spacing.md,
                            },
                          ]}
                        >
                          <Ionicons
                            color={isSelected ? colors.primary : colors.iconMuted}
                            name={isSelected ? 'checkmark-circle' : 'time-outline'}
                            size={18}
                          />
                          <Text
                            color={isSelected ? colors.primary : colors.text}
                            variant="label"
                            weight={isSelected ? 'semiBold' : 'medium'}
                          >
                            {slot.label}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surfaceElevated,
            borderTopColor: colors.divider,
            gap: spacing.sm,
            paddingBottom: insets.bottom + spacing.md,
            paddingHorizontal: gutter,
            paddingTop: spacing.md,
          },
        ]}
      >
        <View style={[styles.footerInner, { gap: spacing.sm, maxWidth: layout.contentMaxWidth.readable }]}>
          <View style={[styles.noteRow, { gap: spacing.sm }]}>
            <Ionicons color={colors.textSubtle} name="information-circle-outline" size={18} />
            <Text color={colors.textSubtle} style={styles.noteText} variant="caption">
              {t('checkout_schedule_unavailable_note')}
            </Text>
          </View>
          <Button
            disabled={isConfirmDisabled}
            fullWidth
            label={t('checkout_schedule_confirm')}
            onPress={() => {
              if (selectedScheduledSlot) {
                onConfirm(selectedScheduledSlot);
              }
            }}
            size="large"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 10,
  },
  contentInner: {
    marginHorizontal: 'auto',
    width: '100%',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerInner: {
    marginHorizontal: 'auto',
    width: '100%',
  },
  intro: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  introCopy: {
    flex: 1,
  },
  introIcon: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  noteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noteText: {
    flexShrink: 1,
  },
  screen: {
    flex: 1,
  },
  slotButton: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '48.5%',
  },
  slotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotSection: {},
  stateBlock: {
    minHeight: 240,
  },
});
