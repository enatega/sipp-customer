import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import type { AddressDetails, AddressPayload, AddressType } from '../../api/addressService';
import AddressTypeSelector from './AddressTypeSelector';

export type AddressDetailFormHandle = { submit: () => Promise<void>; isSaving: boolean };
export type AddressDetailFormSubmitData = AddressPayload & { shouldSetDefault: boolean };
interface Props {
  address: string;
  latitude: number;
  longitude: number;
  initialSetAsDefault?: boolean;
  initialType?: AddressType;
  initialDetails?: AddressDetails | null;
  expectedUpdatedAt?: string;
  onDraftChange?: (details: AddressDetails, type: AddressType) => void;
  onSave: (data: AddressDetailFormSubmitData) => Promise<void>;
}
const fields = ['placeName', 'howToFindYou', 'deliveryInstructions'] as const;
const limits = { placeName: 255, howToFindYou: 1000, deliveryInstructions: 1000 };
const AddressDetailForm = forwardRef<AddressDetailFormHandle, Props>(function AddressDetailForm({ address, latitude, longitude, initialSetAsDefault = false, initialType = 'HOME', initialDetails, expectedUpdatedAt, onDraftChange, onSave }, ref) {
  const { t } = useTranslation('general');
  const { colors } = useTheme();
  const [type, setType] = useState<AddressType>(initialType);
  const [values, setValues] = useState({ placeName: initialDetails?.placeName ?? '', howToFindYou: initialDetails?.howToFindYou ?? '', deliveryInstructions: initialDetails?.deliveryInstructions ?? '' });
  const [shouldSetDefault, setShouldSetDefault] = useState(initialSetAsDefault);
  const [errors, setErrors] = useState<Partial<Record<typeof fields[number] | 'type' | 'address', string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const submitting = useRef(false);
  useImperativeHandle(ref, () => ({ isSaving, submit: async () => {
    if (submitting.current) return;
    const nextErrors: typeof errors = {};
    if (type === 'APARTMENT') nextErrors.type = t('address_details_chooseType');
    if (!values.howToFindYou.trim()) nextErrors.howToFindYou = t('address_details_directionsRequired');
    for (const key of fields) if (values[key].trim().length > limits[key]) nextErrors[key] = t('address_details_tooLong');
    if (!address.trim() || address.length > 255 || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) nextErrors.address = t('address_invalid_coordinates');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    submitting.current = true;
    setIsSaving(true);
    try {
      await onSave({ address: address.trim(), latitude, longitude, type, addressDetailsVersion: 2, expectedUpdatedAt, additional_fields: {
        placeName: values.placeName.trim() || null, howToFindYou: values.howToFindYou.trim(), deliveryInstructions: values.deliveryInstructions.trim() || null,
      }, shouldSetDefault });
    } finally { submitting.current = false; setIsSaving(false); }
  } }));
  return <View style={styles.form}>
    <Text>{address}</Text>
    {errors.address ? <Text accessibilityRole="alert">{errors.address}</Text> : null}
    <AddressTypeSelector selected={type} onSelect={next => { if (!isSaving) { setType(next); onDraftChange?.(values, next); } }} labels={{ home: t('address_type_home'), apartment: t('address_type_apartment'), office: t('address_details_work'), other: t('address_type_other') }} />
    {errors.type ? <Text accessibilityRole="alert">{errors.type}</Text> : null}
    {fields.map(key => <View key={key} style={styles.field}>
      <Text weight="medium">{t(`address_details_${key}Label`)}</Text>
      <TextInput accessibilityLabel={t(`address_details_${key}Label`)} value={values[key]} onChangeText={text => setValues(previous => ({ ...previous, [key]: text })) editable={!isSaving} multiline={key !== 'placeName'} placeholder={t(`address_details_${key}Placeholder`)} placeholderTextColor={colors.mutedText} textAlignVertical="top" style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, minHeight: key === 'placeName' ? 48 : 96 }]} />
      {errors[key] ? <Text accessibilityRole="alert">{errors[key]}</Text> : null}
    </View>)}
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: shouldSetDefault, disabled: isSaving }} disabled={isSaving} onPress={() => setShouldSetDefault(!shouldSetDefault)} style={styles.defaultRow}>
      <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: shouldSetDefault ? colors.primary : colors.surface }]} />
      <Text>{t('address_set_as_default')}</Text>
    </Pressable>
  </View>;
});
export default AddressDetailForm;
const styles = StyleSheet.create({ form: { padding: 20, gap: 20 }, field: { gap: 8 }, input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 }, defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }, checkbox: { width: 22, height: 22, borderWidth: 2, borderRadius: 5 } });
