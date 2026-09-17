import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../general/theme/theme';
import HomeHeader from './home/HomeHeader';
// import HomeTravelBannerSection from './home/HomeTravelBannerSection';
import OurServicesSection from './home/OurServicesSection';
import type { SelectMiniAppFn } from '../apps/registry/homeSections/types';
import { HOME_WIDGETS } from '../apps/registry/generated/appRegistry';

type Props = {
  onSelectMiniApp?: SelectMiniAppFn;
};

export default function HomeScreen({ onSelectMiniApp }: Props) {
  const { colors } = useTheme();
  const RecommendedStoresSection = HOME_WIDGETS.recommendedStores;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HomeHeader backgroundVariant="solid" />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {RecommendedStoresSection ? (
            <RecommendedStoresSection onSelectMiniApp={onSelectMiniApp} />
          ) : null}
          <OurServicesSection onSelectMiniApp={onSelectMiniApp} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
    paddingTop: 0,
  },
});
