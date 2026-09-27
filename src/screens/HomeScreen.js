/** หน้าหลักแสดง grid การ์ดสัตว์เลี้ยง  */
import { SafeAreaView, View, Pressable, Image, StyleSheet } from "react-native";
import { Plus, Calendar, TrendingUp, PawPrint, Trash2 } from "lucide-react-native";

import AppText from "../components/AppText";
import BottomTabBar, { TAB_BAR_CLEARANCE } from "../components/BottomTabBar";
import GradientSurface from "../components/GradientSurface";
import PetIcon from "../components/PetIcon";
import Card from "../components/Card";
import AdBanner from "../components/AdBanner";
import { colors, glass, radius, shadow, shadowLg } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { confirmDialog } from "../utils/confirm";
import { AD_LEVELS, PET_LIMITS } from "../data/constants";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";
import useHideOnScrollBar from "../components/useHideOnScrollBar";


function latestWeight(weightData, id) {
  const arr = weightData?.[id] || [];
  if (!arr.length) return "— kg";
  const latest = arr[arr.length - 1];
  const value = typeof latest === "number" ? latest : latest.value;
  return `${value} kg`;
}

function HomeScreen({ go, pets, weightData, selectPet, removePet, tier = "standard", unreadCount = 0 }) {
  const tabBar = useHideOnScrollBar();
  const adLevel = AD_LEVELS[tier] ?? "banner";
  const confirmRemove = (pet) => {

    confirmDialog({
      title: "ลบสัตว์เลี้ยง",
      message: `ต้องการลบ ${pet.name} ใช่ไหม?`,
      confirmText: "ลบ",
      destructive: true,
      onConfirm: () => removePet(pet.id),
    });
  };

  // กดปุ่มเพิ่มสัตว์ — ถ้าครบจำนวนตามแพ็กเกจแล้ว แจ้งเตือนทันทีพร้อมชวนอัปเกรด
  const pressAdd = () => {
    const limit = PET_LIMITS[tier];
    if (limit != null && pets.length >= limit) {
      confirmDialog({
        title: "จำนวนสัตว์เลี้ยงเต็มตามแพ็กเกจ",
        message: `แพ็กเกจ ${tier.toUpperCase()} รองรับสูงสุด ${limit} ตัว (ขณะนี้มี ${pets.length} ตัว)\nอัปเกรดแพ็กเกจเพื่อเพิ่มสัตว์เลี้ยงได้ที่ "แพ็กเกจของฉัน"`,
        confirmText: "ดูแพ็กเกจ",
        onConfirm: () => go("subscription"),
      });
      return;
    }
    go("addPet");
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <GradientSurface variant="header" style={styles.header}>
        <View style={{ width: 24 }} />
        <AppText style={styles.headerTitle}>สัตว์เลี้ยงของฉัน</AppText>
        <View style={{ width: 24 }} />
      </GradientSurface>
      <AnimatedScrollView onScroll={tabBar.onScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_CLEARANCE }}>
        {adLevel !== "none" && (
          <Reveal>
            <AdBanner level={adLevel} onPressUpgrade={() => go("subscription")} />
          </Reveal>
        )}
        {pets.length === 0 && (
          <Reveal>
            <View style={styles.welcomeBox}>
              <View style={styles.welcomeCircle}>
                <PawPrint size={30} color={colors.accentDeep} strokeWidth={2} />
              </View>
              <AppText style={styles.welcomeTitle}>เริ่มต้นเพิ่มสัตว์เลี้ยงตัวแรก</AppText>
              <AppText style={styles.welcomeSub}>บันทึกสุขภาพ อาหาร และกิจกรรมของเพื่อนสี่ขาได้ที่นี่</AppText>
            </View>
          </Reveal>
        )}
        <View style={styles.petGrid}>
          {pets.map((item) => (
            <Reveal key={item.id} style={styles.petCardWrapper}>
              <Pressable
                onPress={() => selectPet(item.id)}
                onLongPress={() => confirmRemove(item)}
                style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.breed}, ${item.age}, ${latestWeight(weightData, item.id)}. แตะเพื่อเปิดโปรไฟล์ กดค้างเพื่อลบ`}
              >
                <Card style={[glass.surface, styles.petCard]}>
                  {/* ปุ่มลบมุมการ์ด — ทางลบที่มองเห็นได้ นอกจากการกดค้าง */}
                  <Pressable
                    onPress={() => confirmRemove(item)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.85 }]}
                    accessibilityRole="button"
                    accessibilityLabel={`ลบ ${item.name}`}
                  >
                    <Trash2 size={15} color={colors.danger} strokeWidth={2} />
                  </Pressable>
                  <View style={styles.avatarWrap}>
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.petPhoto} resizeMode="cover" />
                    ) : (
                      <PetIcon name={item.icon} size={42} color={colors.brown} />
                    )}
                  </View>
                  <AppText style={styles.petName}>{item.name}</AppText>
                  <AppText style={styles.petBreed}>{item.breed}</AppText>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={13} color={colors.textGray} strokeWidth={2} />
                      <AppText style={styles.metaText}>{item.age}</AppText>
                    </View>
                    <View style={styles.metaItem}>
                      <TrendingUp size={13} color={colors.textGray} strokeWidth={2} />
                      <AppText style={styles.metaStat}>{latestWeight(weightData, item.id)}</AppText>
                    </View>
                  </View>
                </Card>
              </Pressable>
            </Reveal>
          ))}

          <Reveal style={styles.petCardWrapper}>
            <Pressable
              onPress={pressAdd}
              style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
              accessibilityRole="button"
              accessibilityLabel="เพิ่มสัตว์เลี้ยงใหม่"
            >
              <View style={styles.addCard}>
                <View style={styles.addCircle}>
                  <Plus size={32} color={colors.accentDeep} strokeWidth={2.4} />
                </View>
                <AppText style={styles.addLabel}>เพิ่มสัตว์เลี้ยงใหม่</AppText>
              </View>
            </Pressable>
          </Reveal>
        </View>
      </AnimatedScrollView>
      <BottomTabBar active="home" go={go} anim={tabBar.anim} unreadCount={unreadCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  petGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingTop: 14 },
  petCardWrapper: { width: "48%", marginBottom: 18 },
  petCard: { alignItems: "center", paddingVertical: 18, paddingHorizontal: 12 },
  avatarWrap: {
    width: 84,
    height: 84,    borderRadius: radius.full,
    backgroundColor: colors.cardTanBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
    ...shadowLg,
  },
  petPhoto: { width: 84, height: 84, borderRadius: radius.full },
  petName: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  petBreed: { fontSize: 12, fontWeight: "500", color: colors.textBody, marginTop: 2, marginBottom: 10, textAlign: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontWeight: "400", color: colors.textBody },
  metaStat: { fontSize: 12, fontWeight: "700", color: colors.textBody },
  addCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.accentDeep,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    ...shadow,
  },
  addCircle: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.cardTanBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  addLabel: { fontSize: 14, fontWeight: "600", color: colors.accentDeep },
  // ปุ่มลบมุมการ์ดสัตว์เลี้ยง
  removeBtn: { position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  // กล่องต้อนรับตอนยังไม่มีสัตว์เลี้ยง
  welcomeBox: { alignItems: "center", paddingVertical: 22, paddingHorizontal: 16, marginBottom: 6, borderRadius: radius.md, ...glass.surface },
  welcomeCircle: {
    width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.cardTanBg,
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  welcomeTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, marginBottom: 4 },
  welcomeSub: { fontSize: 13, fontWeight: "400", color: colors.textBody, textAlign: "center", maxWidth: 260 },
});

export default HomeScreen;
