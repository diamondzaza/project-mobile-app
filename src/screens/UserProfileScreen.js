/** หน้าจอโปรไฟล์ของเจ้าของ*/
import { SafeAreaView, View, Pressable, Alert, Image, StyleSheet } from "react-native";
import { LogOut, Pencil, User, Camera, Mail, Phone } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import Card from "../components/Card";
import AppText from "../components/AppText";
import StatBox from "../components/StatBox";
import SettingsRow from "../components/SettingsRow";
import BottomTabBar, { TAB_BAR_CLEARANCE } from "../components/BottomTabBar";
import GradientSurface from "../components/GradientSurface";
import { Button } from "../components/ui";
import { colors, category, radius, shadow } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";
import useHideOnScrollBar from "../components/useHideOnScrollBar";
import { confirmDialog } from "../utils/confirm";

function UserProfileScreen({ go, user, pets = [], appointments = [], notifications = [], updateUser, tier = "standard" }) {
  const tabBar = useHideOnScrollBar();
  const upcomingCount = appointments.length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const confirmLogout = () =>
    confirmDialog({
      title: "ออกจากระบบ",
      message: "คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?",
      confirmText: "ออกจากระบบ",
      destructive: true,
      onConfirm: () => go("logout"),
    });

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ต้องการสิทธิ์การเข้าถึง", "กรุณาอนุญาตให้เข้าถึงรูปภาพเพื่อตั้งค่ารูปโปรไฟล์");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      updateUser({ photo: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <AnimatedScrollView onScroll={tabBar.onScroll} contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE }}>
        <GradientSurface variant="cover" style={styles.profileCover}>
          <View style={{ width: 32 }} />
          <AppText style={styles.headerTitle}>โปรไฟล์ของฉัน</AppText>
          <Pressable
            onPress={() => go("editProfile")}
            style={({ pressed }) => [styles.editFab, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="แก้ไขโปรไฟล์"
          >
            <Pencil size={18} color={colors.brown} strokeWidth={2} />
          </Pressable>
        </GradientSurface>

        <View style={{ alignItems: "center", marginTop: -46 }}>
          <Pressable style={({ pressed }) => [styles.avatarOuter, pressed && { opacity: 0.85 }]} onPress={pickPhoto}>
            <View style={styles.ownerAvatarLarge}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.ownerAvatarImg} resizeMode="cover" />
              ) : (
                <User size={44} color={colors.brownLight} strokeWidth={2} />
              )}
            </View>
            <View style={styles.avatarCameraBadge}>
              <Camera size={14} color={colors.white} strokeWidth={2} />
            </View>
          </Pressable>
          <AppText style={styles.ownerNameLarge}>{user.name}</AppText>
          {user.email ? (
            <View style={styles.contactRow}>
              <Mail size={13} color={colors.textGray} strokeWidth={2} />
              <AppText style={styles.contactText}>{user.email}</AppText>
            </View>
          ) : null}
          {user.phone ? (
            <View style={styles.contactRow}>
              <Phone size={13} color={colors.textGray} strokeWidth={2} />
              <AppText style={styles.contactText}>{user.phone}</AppText>
            </View>
          ) : null}
        </View>

        <Reveal>
          <View style={styles.statsRow}>
            <Pressable
              onPress={() => go("home")}
              style={({ pressed }) => [styles.statHit, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="สัตว์เลี้ยง ไปหน้าหลัก"
            >
              <StatBox
                icon="heart"
                label="สัตว์เลี้ยง"
                value={pets.length}
                bgColor={category.food.soft}
                iconColor={category.food.main}
              />
            </Pressable>
            <Pressable
              onPress={() => go("overallAppointments")}
              style={({ pressed }) => [styles.statHit, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="นัดหมาย ไปหน้านัดหมายทั้งหมด"
            >
              <StatBox
                icon="calendar"
                label="นัดหมาย"
                value={upcomingCount}
                bgColor={category.appointments.soft}
                iconColor={category.appointments.main}
              />
            </Pressable>
            {unreadCount > 0 && (
              <Pressable
                onPress={() => go("notifications")}
                style={({ pressed }) => [styles.statHit, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel="ยังไม่ได้อ่าน ไปหน้าการแจ้งเตือน"
              >
                <StatBox
                  icon="bell"
                  label="ยังไม่ได้อ่าน"
                  value={unreadCount}
                  bgColor={category.health.soft}
                  iconColor={category.health.main}
                />
              </Pressable>
            )}
          </View>
        </Reveal>

        <Reveal>
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <AppText style={styles.settingsSectionTitle}>บัญชี</AppText>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <SettingsRow
                icon="award"
                label={`แพ็กเกจของฉัน (${tier.toUpperCase()})`}
                onPress={() => go("subscription")}
              />
              <View style={styles.divider} />
              <SettingsRow icon="user" label="แก้ไขโปรไฟล์" onPress={() => go("editProfile")} />
              <View style={styles.divider} />
              <SettingsRow icon="bell" label="ตั้งค่าการแจ้งเตือน" onPress={() => go("notifications")} />
              <View style={styles.divider} />
              <SettingsRow
                icon="lock"
                label="ความเป็นส่วนตัวและความปลอดภัย (เร็ว ๆ นี้)"
                dim
                onPress={() => Alert.alert("ความเป็นส่วนตัวและความปลอดภัย", "เร็ว ๆ นี้")}
              />
            </Card>

            <AppText style={[styles.settingsSectionTitle, { marginTop: 20 }]}>ช่วยเหลือ</AppText>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <SettingsRow
                icon="help-circle"
                label="ศูนย์ช่วยเหลือ (เร็ว ๆ นี้)"
                dim
                onPress={() => Alert.alert("ศูนย์ช่วยเหลือ", "เร็ว ๆ นี้")}
              />
              <View style={styles.divider} />
              <SettingsRow
                icon="info"
                label="เกี่ยวกับ Pet Care Planner"
                onPress={() => Alert.alert("Pet Care Planner", "เวอร์ชัน 1.0.0")}
              />
            </Card>

            <Button
              title="ออกจากระบบ"
              variant="destructive"
              size="lg"
              onPress={confirmLogout}
              iconLeft={<LogOut size={18} color={colors.white} strokeWidth={2.2} />}
              style={{ width: "100%", marginTop: 20, marginBottom: 10 }}
            />
          </View>
        </Reveal>
      </AnimatedScrollView>
      <BottomTabBar active="userProfile" go={go} anim={tabBar.anim} unreadCount={unreadCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  profileCover: {
    height: 150,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  editFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  avatarOuter: {
    width: 96,
    height: 96,
    position: "relative",
  },
  ownerAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
    ...shadow,
  },
  ownerAvatarImg: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.greenDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  ownerNameLarge: { fontSize: 22, fontWeight: "700", color: colors.textDark, marginTop: 14 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  contactText: { fontSize: 13, fontWeight: "400", color: colors.textGray },
  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 24, gap: 12 },
  // ครอบ StatBox ให้กดได้ทั้งก้อน
  statHit: { flex: 1 },
  // หัวข้อ section ภาษาไทย — ไม่ใช้ uppercase/letterSpacing
  settingsSectionTitle: { fontSize: 13, fontWeight: "600", color: colors.textBody, marginBottom: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 62 },
});

export default UserProfileScreen;
