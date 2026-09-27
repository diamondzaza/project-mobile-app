/** แถบนำทางด้านล่าง*/
import { View, Pressable, StyleSheet, Animated } from "react-native";
import { House, Bell, Calendar, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, glass, radius } from "../theme";
import AppText from "./AppText";


const HIDE_DISTANCE = 90;
export const TAB_BAR_CLEARANCE = 128;

export default function BottomTabBar({ active, go, anim, unreadCount = 0 }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: "home", icon: House, screen: "home", label: "หน้าแรก" },
    { key: "notifications", icon: Bell, screen: "notifications", label: "แจ้งเตือน" },
    { key: "overallAppointments", icon: Calendar, screen: "overallAppointments", label: "นัดหมาย" },
    { key: "userProfile", icon: User, screen: "userProfile", label: "โปรไฟล์" },
  ];
  const animatedStyle = anim
    ? {
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, HIDE_DISTANCE + insets.bottom],
            }),
          },
        ],
      }
    : null;
  const Container = anim ? Animated.View : View;
  return (
    <Container style={[styles.tabBar, glass.bar, { bottom: 12 + insets.bottom }, animatedStyle]}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.key;
        const showBadge = t.key === "notifications" && unreadCount > 0;
        return (
          <Pressable
            key={t.key}
            onPress={() => go(t.screen)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t.label}
            hitSlop={{ top: 4, bottom: 4, left: 6, right: 6 }}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
          >
            <View>
              <Icon size={22} color={isActive ? colors.greenDark : colors.textGray} strokeWidth={isActive ? 2.4 : 2} />
              {showBadge && <View style={styles.badge} />}
            </View>
            <AppText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{t.label}</AppText>
          </Pressable>
        );
      })}
    </Container>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  tabItem: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  tabItemActive: { backgroundColor: "rgba(255,255,255,0.45)" },
  tabLabel: { fontSize: 11, color: colors.textGray, marginTop: 2 },
  tabLabelActive: { color: colors.greenDark, fontWeight: "600" },
  badge: {
    position: "absolute",
    top: -2,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
});
