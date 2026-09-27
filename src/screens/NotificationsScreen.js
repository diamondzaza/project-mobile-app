/** หน้าการแจ้งเตือน */
import { SafeAreaView, View, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Bell, Calendar, TrendingUp, Heart, Activity, Coffee, FileText, ChevronRight } from "lucide-react-native";

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

const styles = StyleSheet.create({
  markAll: { fontSize: 13, fontWeight: "600", color: colors.accent },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentDeep, marginRight: 6 },
  titleRow: { flexDirection: "row", alignItems: "center" },
});


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
  food: Coffee,
  petAppointments: Calendar,
  appointments: Calendar,
  weight: TrendingUp,
  health: Heart,
  activity: Activity,
  activityLog: Activity,
  notes: FileText,
};

function metaFor(screen) {
  const catKey = CATEGORY_BY_SCREEN[screen];
  const Icon = ICON_BY_SCREEN[screen] || Bell;
  if (catKey) {
    const c = category[catKey];
    return { Icon, bg: c.soft, color: c.main };
  }
  return { Icon, bg: colors.greenPastel, color: colors.brown };
}

function NotificationsScreen({ go, notifications, onOpen, removeNotification, onMarkAllRead, loading = false }) {
  const tabBar = useHideOnScrollBar();
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header
        title="การแจ้งเตือน"
        right={
          onMarkAllRead && unreadCount > 0 ? (
            <Pressable onPress={onMarkAllRead} hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
              <AppText style={styles.markAll}>อ่านทั้งหมด</AppText>
            </Pressable>
          ) : undefined
        }
      />
      <AnimatedScrollView
        onScroll={tabBar.onScroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: TAB_BAR_CLEARANCE }}
      >
        {loading ? (
          // กำลังโหลดจาก Supabase — แสดง spinner กลางจอแทนลิสต์
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.accentDeep} />
          </View>
        ) : (
          <>
            {notifications.length === 0 && <EmptyState category="notifications" />}
            {notifications.map((n) => {
              const { Icon, bg, color } = metaFor(n.screen);
              return (
                <Reveal key={n.id}>
                  <Pressable onPress={() => onOpen(n)} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
                    <Card
                      style={{
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        opacity: n.read ? 0.55 : 1,
                      }}
                    >
                      <View
                        style={[sharedStyles.iconWrap, { backgroundColor: bg }]}
                      >
                        <Icon size={20} color={color} strokeWidth={2} />
                      </View>
                      <View style={{ marginLeft: 14, flex: 1 }}>
                        <View style={styles.titleRow}>
                          {!n.read && <View style={styles.unreadDot} />}
                          <AppText
                            style={[sharedStyles.rowTitle, { fontWeight: "600", flex: 1 }]}
                            numberOfLines={1}
                          >
                            {n.title}
                          </AppText>
                        </View>
                        <AppText style={[sharedStyles.rowDate, { fontWeight: "400" }]}>
                          {n.time}
                          {n.read ? " · อ่านแล้ว" : ""}
                        </AppText>
                      </View>
                      {/* ลูกศรบอกว่าการ์ดแตะได้ */}
                      <ChevronRight size={18} color={colors.textGray} strokeWidth={2} />
                      <IconButton icon="x" color={colors.red} onPress={() => removeNotification(n.id)} />
                    </Card>
                  </Pressable>
                </Reveal>
              );
            })}
          </>
        )}
      </AnimatedScrollView>
      <BottomTabBar active="notifications" go={go} anim={tabBar.anim} unreadCount={unreadCount} />
    </SafeAreaView>
  );
}

export default NotificationsScreen;
