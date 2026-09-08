/** แถบนำทางด้านล่าง*/
import { View, Pressable, StyleSheet, Animated } from "react-native";
import { House, Bell, Calendar, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, glass, radius } from "../theme";


const HIDE_DISTANCE = 90;
export const TAB_BAR_CLEARANCE = 108;

export default function BottomTabBar({ active, go, anim }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: "home", icon: House, screen: "home" },
    { key: "notifications", icon: Bell, screen: "notifications" },
    { key: "overallAppointments", icon: Calendar, screen: "overallAppointments" },
    { key: "userProfile", icon: User, screen: "userProfile" },
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
        return (
          <Pressable key={t.key} onPress={() => go(t.screen)} style={[styles.tabItem, isActive && styles.tabItemActive]}>
            <Icon size={22} color={isActive ? colors.greenDark : colors.textGray} strokeWidth={isActive ? 2.4 : 2} />
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  tabItem: { padding: 8, borderRadius: radius.full },
  tabItemActive: { backgroundColor: "rgba(255,255,255,0.45)" },
});
