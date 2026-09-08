/** หน้าจอโปรไฟล์ของเจ้าของ*/
import { SafeAreaView, View, Pressable, Alert, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LogOut } from "lucide-react-native";
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

function UserProfileScreen({ go, user, pets = [], appointments = [], notifications = [], updateUser }) {
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
          <Pressable onPress={() => go("editProfile")} style={styles.editFab}>
            <Feather name="edit-2" size={16} color={colors.brown} />
          </Pressable>
        </GradientSurface>

        <View style={{ alignItems: "center", marginTop: -46 }}>
          <Pressable style={styles.avatarOuter} onPress={pickPhoto}>
            <View style={styles.ownerAvatarLarge}>
              {user.photo ? (
                <Image source={{ uri: user.photo }} style={styles.ownerAvatarImg} resizeMode="cover" />
              ) : (
                <Feather name="user" size={44} color={colors.brownLight} />
              )}
            </View>
            <View style={styles.avatarCameraBadge}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <AppText style={styles.ownerNameLarge}>{user.name}</AppText>
          <View style={styles.contactRow}>
            <Feather name="mail" size={13} color={colors.textGray} />
            <AppText style={styles.contactText}>{user.email}</AppText>
          </View>
          <View style={styles.contactRow}>
            <Feather name="phone" size={13} color={colors.textGray} />
            <AppText style={styles.contactText}>{user.phone}</AppText>
          </View>
        </View>

        <Reveal>
          <View style={styles.statsRow}>
            <StatBox
              icon="heart"
              label="สัตว์เลี้ยง"
              value={pets.length}
              bgColor={category.food.soft}
              iconColor={category.food.main}
            />
            <StatBox
              icon="calendar"
              label="นัดหมาย"
              value={upcomingCount}
              bgColor={category.appointments.soft}
              iconColor={category.appointments.main}
            />
            <StatBox
              icon="bell"
              label="ยังไม่ได้อ่าน"
              value={unreadCount}
              bgColor={category.health.soft}
              iconColor={category.health.main}
            />
          </View>
        </Reveal>

        <Reveal>
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <AppText style={styles.settingsSectionTitle}>บัญชี</AppText>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <SettingsRow icon="user" label="แก้ไขโปรไฟล์" onPress={() => go("editProfile")} />
              <View style={styles.divider} />
              <SettingsRow icon="bell" label="ตั้งค่าการแจ้งเตือน" onPress={() => go("notifications")} />
              <View style={styles.divider} />
              <SettingsRow
                icon="lock"
                label="ความเป็นส่วนตัวและความปลอดภัย"
                onPress={() => Alert.alert("ความเป็นส่วนตัวและความปลอดภัย", "เร็ว ๆ นี้")}
              />
            </Card>

            <AppText style={[styles.settingsSectionTitle, { marginTop: 20 }]}>ช่วยเหลือ</AppText>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <SettingsRow
                icon="help-circle"
                label="ศูนย์ช่วยเหลือ"
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
              iconLeft={<LogOut size={18} color="#FFFFFF" strokeWidth={2.2} />}
              style={{ width: "100%", marginTop: 20, marginBottom: 10 }}
            />
          </View>
        </Reveal>
      </AnimatedScrollView>
      <BottomTabBar active="userProfile" go={go} anim={tabBar.anim} />
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
  settingsSectionTitle: { fontSize: 13, fontWeight: "600", color: colors.textBody, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 62 },
});

export default UserProfileScreen;
