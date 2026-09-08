/** หน้าหลักแสดง grid การ์ดสัตว์เลี้ยง  */
import { SafeAreaView, View, Pressable, Image, StyleSheet } from "react-native";
import { Plus, Calendar, TrendingUp } from "lucide-react-native";

import AppText from "../components/AppText";
import BottomTabBar, { TAB_BAR_CLEARANCE } from "../components/BottomTabBar";
import GradientSurface from "../components/GradientSurface";
import PetIcon from "../components/PetIcon";
import Card from "../components/Card";
import { colors, radius, shadow, shadowLg } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { confirmDialog } from "../utils/confirm";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";
import useHideOnScrollBar from "../components/useHideOnScrollBar";


const glassCard = {
  backgroundColor: "rgba(255,255,255,0.72)",
  borderColor: "rgba(255,255,255,0.5)",
  borderWidth: 1,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 5,
};

const accentDeep = "#A8552E";

function latestWeight(weightData, id) {
  const arr = weightData?.[id] || [];
  if (!arr.length) return "— kg";
  const latest = arr[arr.length - 1];
  const value = typeof latest === "number" ? latest : latest.value;
  return `${value} kg`;
}

function HomeScreen({ go, pets, weightData, selectPet, removePet }) {
  const tabBar = useHideOnScrollBar();
  const confirmRemove = (pet) => {
  
    confirmDialog({
      title: "ลบสัตว์เลี้ยง",
      message: `ต้องการลบ ${pet.name} ใช่ไหม?`,
      confirmText: "ลบ",
      destructive: true,
      onConfirm: () => removePet(pet.id),
    });
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <GradientSurface variant="header" style={styles.header}>
        <View style={{ width: 24 }} />
        <AppText style={styles.headerTitle}>สัตว์เลี้ยงของฉัน</AppText>
        <View style={{ width: 24 }} />
      </GradientSurface>
      <AnimatedScrollView onScroll={tabBar.onScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_CLEARANCE }}>
        <View style={styles.petGrid}>
          {pets.map((item) => (
            <Reveal key={item.id} style={styles.petCardWrapper}>
              <Pressable
                onPress={() => selectPet(item.id)}
                onLongPress={() => confirmRemove(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.breed}, ${item.age}, ${latestWeight(weightData, item.id)}. แตะเพื่อเปิดโปรไฟล์ กดค้างเพื่อลบ`}
              >
                <Card style={[glassCard, styles.petCard]}>
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
            <Pressable onPress={() => go("addPet")} accessibilityRole="button" accessibilityLabel="เพิ่มสัตว์เลี้ยงใหม่">
              <View style={styles.addCard}>
                <View style={styles.addCircle}>
                  <Plus size={32} color={accentDeep} strokeWidth={2.4} />
                </View>
                <AppText style={styles.addLabel}>เพิ่มสัตว์เลี้ยงใหม่</AppText>
              </View>
            </Pressable>
          </Reveal>
        </View>
      </AnimatedScrollView>
      <BottomTabBar active="home" go={go} anim={tabBar.anim} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.textDark },
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
    borderColor: "rgba(168,85,46,0.9)",
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
  addLabel: { fontSize: 14, fontWeight: "600", color: accentDeep },
});

export default HomeScreen;
