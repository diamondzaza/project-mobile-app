/** หน้าการแจ้งเตือน */
import { SafeAreaView, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import Card from "../components/Card";
import AppText from "../components/AppText";
import Header from "../components/Header";
import IconButton from "../components/IconButton";
import BottomTabBar, { TAB_BAR_CLEARANCE } from "../components/BottomTabBar";
import EmptyState from "../components/EmptyState";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";
import useHideOnScrollBar from "../components/useHideOnScrollBar";
import { colors, category, radius } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";


const CATEGORY_BY_SCREEN = {
  food: "food",
  petAppointments: "appointments",
  appointments: "appointments",
  weight: "health",
  health: "health",
  activity: "activity",
  activityLog: "activity",
};


const ICON_BY_SCREEN = {
  food: "coffee",
  petAppointments: "calendar",
  appointments: "calendar",
  weight: "trending-up",
  health: "heart",
  activity: "activity",
  activityLog: "activity",
  notes: "file-text",
};

function metaFor(screen) {
  const catKey = CATEGORY_BY_SCREEN[screen];
  const icon = ICON_BY_SCREEN[screen] || "bell";
  if (catKey) {
    const c = category[catKey];
    return { icon, bg: c.soft, color: c.main };
  }
  return { icon, bg: colors.greenPastel, color: colors.brown };
}

function NotificationsScreen({ go, notifications, onOpen, removeNotification }) {
  const tabBar = useHideOnScrollBar();
  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="การแจ้งเตือน" />
      <AnimatedScrollView
        onScroll={tabBar.onScroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: TAB_BAR_CLEARANCE }}
      >
        {notifications.length === 0 && <EmptyState category="notifications" />}
        {notifications.map((n) => {
          const meta = metaFor(n.screen);
          return (
            <Reveal key={n.id}>
              <Pressable onPress={() => onOpen(n)}>
                <Card
                  style={{
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    opacity: n.read ? 0.55 : 1,
                  }}
                >
                  <View
                    style={[sharedStyles.iconWrap, { backgroundColor: meta.bg }]}
                  >
                    <Feather name={meta.icon} size={20} color={meta.color} />
                  </View>
                  <View style={{ marginLeft: 14, flex: 1 }}>
                    <AppText
                      style={[sharedStyles.rowTitle, { fontWeight: "600" }]}
                    >
                      {n.title}
                    </AppText>
                    <AppText style={[sharedStyles.rowDate, { fontWeight: "400" }]}>
                      {n.time}
                      {n.read ? " · อ่านแล้ว" : ""}
                    </AppText>
                  </View>
                  <IconButton icon="x" color={colors.red} onPress={() => removeNotification(n.id)} />
                </Card>
              </Pressable>
            </Reveal>
          );
        })}
      </AnimatedScrollView>
      <BottomTabBar active="notifications" go={go} anim={tabBar.anim} />
    </SafeAreaView>
  );
}

export default NotificationsScreen;
