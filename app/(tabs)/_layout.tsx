import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router/js-tabs";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

import { useAttentionCount } from "@/features/orders/use-orders";
import { colors, fonts, space } from "@/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

function tabIcon(name: IconName, focusedName: IconName) {
  return ({ focused, color }: { focused: boolean; color: ColorValue }) => (
    <MaterialCommunityIcons name={focused ? focusedName : name} size={24} color={color} />
  );
}

const TAB_BAR_HEIGHT = 64;

export default function TabsLayout() {
  const attention = useAttentionCount();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.brandStrong,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          minHeight: TAB_BAR_HEIGHT,
          paddingTop: space.xs,
        },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
        tabBarBadgeStyle: {
          backgroundColor: colors.brand,
          color: colors.onBrand,
          fontFamily: fonts.bold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="pesanan/index"
        options={{
          title: "Pesanan",
          tabBarIcon: tabIcon("receipt-text-outline", "receipt-text"),
          tabBarBadge: attention > 0 ? attention : undefined,
        }}
      />
      <Tabs.Screen
        name="item/index"
        options={{ title: "Item", tabBarIcon: tabIcon("tag-outline", "tag") }}
      />
      <Tabs.Screen
        name="laporan/index"
        options={{ title: "Laporan", tabBarIcon: tabIcon("chart-box-outline", "chart-box") }}
      />
      <Tabs.Screen
        name="profil/index"
        options={{ title: "Profil", tabBarIcon: tabIcon("storefront-outline", "storefront") }}
      />
    </Tabs>
  );
}
