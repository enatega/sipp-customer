import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme';
import { useAppLogout } from '../../hooks/useAppLogout';
import type {
  ProfileUser,
  WalletResponse,
} from '../../api/profileService';
import type { ProfileTabNavigationParamList } from '../../navigation/profileTypes';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import ProfileMenuSection from '../../components/profile/ProfileMenuSection';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import WalletCard from '../../components/profile/WalletCard';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AppPopup from '../../components/AppPopup';

const ICON_SIZE = 20;

type Props = {
  favoritesEnabled?: boolean;
  couponsEnabled?: boolean;
  isLoading: boolean;
  onOpenCoupons?: () => void;
  onOpenFavourites?: () => void;
  onOpenNotifications?: () => void;
  onOpenOrders?: () => void;
  subtitle?: string;
  user: ProfileUser | null;
  wallet: WalletResponse['data'] | null;
};

export default function ProfileTabScreen({
  favoritesEnabled = false,
  couponsEnabled = true,
  isLoading,
  onOpenCoupons,
  onOpenFavourites,
  onOpenNotifications,
  onOpenOrders,
  subtitle,
  user,
  wallet,
}: Props) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation('general');
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation =
    useNavigation<NavigationProp<ProfileTabNavigationParamList>>();
  const logoutMutation = useAppLogout();
  const [isLogoutConfirmationVisible, setIsLogoutConfirmationVisible] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsLogoutConfirmationVisible(false);
    } catch {
      // The mutation retains its error state; keep the dialog open for retry.
    }
  }, [logoutMutation]);

  if (isLoading) {
    return (
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + insets.bottom + spacing.lg,
          paddingTop: insets.top,
        }}
      >
        <ProfileSkeleton hasFeatureCard />
      </ScrollView>
    );
  }

  const iconColor = colors.text;

  return (
    <View style={styles.screen}>
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: tabBarHeight + insets.bottom + spacing.lg,
          paddingTop: insets.top,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader
        name={user?.name}
        imageUri={user?.image}
        subtitle={subtitle ?? t('profile_personal_account')}
        editLabel={t('my_profile_edit')}
        onPress={() => navigation.navigate('MyProfile')}
      />

      <ProfileMenuSection title={t('profile_section_essentials')}>
        <ProfileMenuItem
          icon={<Ionicons name="receipt-outline" size={ICON_SIZE} color={colors.quickActionOrdersForeground} />}
          iconSurfaceColor={colors.quickActionOrdersSurface}
          label={t('profile_menu_orders')}
          subtitle={t('profile_menu_orders_subtitle')}
          onPress={onOpenOrders}
        />
        <ProfileMenuItem
          icon={<Ionicons name="location-outline" size={ICON_SIZE} color={colors.quickActionBrowseForeground} />}
          iconSurfaceColor={colors.quickActionBrowseSurface}
          label={t('profile_menu_addresses')}
          subtitle={t('profile_menu_addresses_subtitle')}
          onPress={() => navigation.navigate('MyProfile')}
        />
        <ProfileMenuItem
          icon={<Ionicons name="heart-outline" size={ICON_SIZE} color={colors.quickActionFavouritesForeground} />}
          iconSurfaceColor={colors.quickActionFavouritesSurface}
          label={t('profile_menu_favorites')}
          subtitle={t('profile_menu_favorites_subtitle')}
          onPress={favoritesEnabled ? onOpenFavourites : undefined}
        />
      </ProfileMenuSection>

      <WalletCard
        balance={wallet?.wallet_balance}
        balanceLabel={t('profile_wallet_balance')}
        buttonLabel={t('profile_view_wallet')}
        onPressWallet={() => navigation.navigate('Wallet')}
      />

      <ProfileMenuSection title={t('profile_section_preferences')}>
        <ProfileMenuItem
          icon={<Ionicons name="notifications-outline" size={ICON_SIZE} color={iconColor} />}
          label={t('profile_menu_notifications')}
          onPress={onOpenNotifications}
        />
        {couponsEnabled && (
        <ProfileMenuItem
          icon={<Ionicons name="pricetag-outline" size={ICON_SIZE} color={colors.quickActionDealsForeground} />}
          iconSurfaceColor={colors.quickActionDealsSurface}
          label={t('profile_menu_coupons')}
          onPress={onOpenCoupons}
        />
        )}
        <ProfileMenuItem
          icon={<Ionicons name="settings-outline" size={ICON_SIZE} color={iconColor} />}
          label={t('profile_menu_settings')}
          onPress={() => navigation.navigate('Settings')}
        />
      </ProfileMenuSection>

      <ProfileMenuSection title={t('profile_section_more')}>
        <ProfileMenuItem
          icon={<Ionicons name="help-buoy-outline" size={ICON_SIZE} color={iconColor} />}
          label={t('profile_menu_support')}
          onPress={() => navigation.navigate('Support')}
        />
        <ProfileMenuItem
          icon={<Ionicons name="moon-outline" size={ICON_SIZE} color={iconColor} />}
          label={t('profile_menu_color_mode')}
          onPress={() => navigation.navigate('ColorMode')}
        />
        <ProfileMenuItem
          icon={<Ionicons name="globe-outline" size={ICON_SIZE} color={iconColor} />}
          label={t('profile_menu_language')}
          onPress={() => navigation.navigate('Language')}
        />
      </ProfileMenuSection>

      <ProfileMenuSection>
        <ProfileMenuItem
          icon={<Ionicons name="log-out-outline" size={ICON_SIZE} color={colors.danger} />}
          iconSurfaceColor={colors.dangerSoft}
          label={t('profile_menu_logout')}
          tone="danger"
          onPress={() => setIsLogoutConfirmationVisible(true)}
        />
      </ProfileMenuSection>
    </ScrollView>
    <AppPopup
      visible={isLogoutConfirmationVisible}
      title={t('profile_logout_confirm_title')}
      description={
        logoutMutation.isError
          ? t('profile_logout_confirm_error')
          : t('profile_logout_confirm_description')
      }
      onRequestClose={() => {
        if (!logoutMutation.isPending) {
          setIsLogoutConfirmationVisible(false);
        }
      }}
      primaryAction={{
        label: t('profile_logout_confirm_action'),
        onPress: () => void handleLogout(),
        variant: 'danger',
        isLoading: logoutMutation.isPending,
      }}
      secondaryAction={{
        label: t('profile_logout_confirm_cancel'),
        onPress: () => setIsLogoutConfirmationVisible(false),
        variant: 'secondary',
        disabled: logoutMutation.isPending,
      }}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
  },
  scroll: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
