import { StyleSheet, View } from "react-native";
import React, { useState } from "react";
import TabSwitcher from "../../../../general/components/TabSwitcher";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../../general/theme/theme";
import ScheduleDeliveriesSection from "./ScheduleDeliveriesSection";
import { useTranslation } from "react-i18next";
import OrderHistorySection from "./OrderHistorySection";
import ActiveOrdersSection from "./ActiveOrdersSection";
import Text from "../../../../general/components/Text";
import { useWindowClass } from "../../../../general/hooks/useWindowClass";

const MainOrdersContainer = () => {
  const { t } = useTranslation("deliveries");
  const TABS = [
    { key: "activeOrders", label: t("orders_tab_active") },
    { key: "orderHistory", label: t("orders_tab_history") },
    { key: "scheduleDeliveries", label: t("orders_tab_scheduled") },
  ];
  const { colors, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const [activeTab, setActiveTab] = useState("activeOrders");

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.canvas }]}
    >
      <View style={[styles.content, { paddingHorizontal: gutter }]}> 
        <View style={[styles.intro, { marginBottom: spacing.xl }]}> 
          <Text color={colors.textStrong} variant="screenTitle" weight="extraBold">
            {t("orders_screen_title")}
          </Text>
          <Text color={colors.textSubtle} variant="supporting" weight="medium">
            {t("orders_screen_subtitle")}
          </Text>
        </View>
        <TabSwitcher
          tabs={TABS}
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(() => key);
          }}
          style={styles.tabs}
        />
        {activeTab === "activeOrders" ? (
          <ActiveOrdersSection />
        ) : activeTab === "orderHistory" ? (
          <OrderHistorySection />
        ) : (
          <ScheduleDeliveriesSection />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MainOrdersContainer;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  intro: {
    gap: 6,
    paddingTop: 12,
  },
  tabs: {
    marginBottom: 8,
  },
});
