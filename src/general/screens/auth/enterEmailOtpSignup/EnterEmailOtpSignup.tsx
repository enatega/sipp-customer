import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../stores/useAuthStore';

// Old navigation state can still point here after an app update. Customer
// signup now verifies the phone, so request a new phone code.
export default function EnterEmailOtpSignup() {
  const navigation = useNavigation();
  React.useEffect(() => {
    useAuthStore.getState().setOtpType('sms');
    useAuthStore.getState().setOtpSent(false);
    navigation.navigate('signup' as never);
  }, [navigation]);
  return null;
}
