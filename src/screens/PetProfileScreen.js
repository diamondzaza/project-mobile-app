/** หน้าโปรไฟล์สัตว์เลี้ยง dashboard  */
import { SafeAreaView, View, Pressable, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import AppText from "../components/AppText";

import { colors, shadowLg } from "../theme";
import PetIcon from "../components/PetIcon";
import { timeAgo } from "../utils/date";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";


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

const glassCardStrong = {
  ...glassCard,
  backgroundColor: "rgba(255,255,255,0.8)",
  borderColor: "rgba(201,123,90,0.4)",
  shadowOpacity: 0.14,
  elevation: 7,
};

function PetProfileScreen({ go, activePet, weightData, healthData, appointments, foodData, activityData, notesData }) {
  if (!activePet) return null;

  const wData = (weightData[activePet.id] || [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestW = wData.length ? wData[wData.length - 1].value : null;
  const prevW = wData.length > 1 ? wData[wData.length - 2].value : null;
  let trendText = "บันทึกแรก";
  if (latestW != null && prevW != null) {
    const delta = +(latestW - prevW).toFixed(1);
    trendText = delta === 0 ? "คงที่" : delta > 0 ? `▲ +${delta} kg` : `▼ ${delta} kg`;
  }

  // สถานะย่อยของแต่ละหมวด
  const healthUpcoming = (healthData[activePet.id]?.upcoming || []).length;
  const apptCount = appointments.filter((a) => a.petId === activePet.id).length;
  const foodItems = foodData[activePet.id] || [];
  const lastFood = foodItems.filter((f) => f.createdAt).slice(-1)[0];
  const actItems = activityData[activePet.id] || [];
  const noteCount = (notesData[activePet.id] || []).length;


  const cards = [
    { title: "น้ำหนัก", icon: "trending-up", soft: "#DCE9F5", main: "#4A7AB0", deep: "#335C8A", screen: "weight", status: latestW != null ? `${latestW} kg` : "ยังไม่มีข้อมูล" },
    { title: "สุขภาพ", icon: "heart", soft: "#F6E0DC", main: "#C76B61", deep: "#A8473D", screen: "health", status: `${healthUpcoming} รายการที่กำลังจะมาถึง` },
    { title: "นัดหมาย", icon: "calendar", soft: "#EDE3F3", main: "#8A6FB0", deep: "#6E5390", screen: "petAppointments", status: `${apptCount} นัดที่กำลังจะมาถึง` },
    { title: "อาหาร", icon: "coffee", soft: "#F3D9C2", main: "#C97B5A", deep: "#A8552E", screen: "food", status: lastFood ? `ให้อาหารเมื่อ ${timeAgo(new Date(lastFood.createdAt))}` : "ยังไม่มีมื้ออาหาร" },
    { title: "กิจกรรม", icon: "activity", soft: "#F3D9C2", main: "#C97B5A", deep: "#A8552E", screen: "activityLog", status: actItems.length ? `บันทึกแล้ว ${actItems.length} รายการ` : "ยังไม่มีกิจกรรม" },
    { title: "โน้ต", icon: "file-text", soft: "#F5EBC8", main: "#9C8B2E", deep: "#7A6C1E", screen: "notes", status: `โน้ต ${noteCount} รายการ` },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AnimatedScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <LinearGradient
            colors={["#8F4A26", "#A8552E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <Pressable onPress={() => go("home")} style={styles.circleBtn} accessibilityRole="button" accessibilityLabel="กลับไปหน้าสัตว์เลี้ยงของฉัน">
                <Feather name="chevron-left" size={22} color="#FFFFFF" />
              </Pressable>
              <View style={styles.agePill}>
                <AppText style={styles.agePillText}>{activePet.age || "ใหม่"}</AppText>
              </View>
            </View>
            <AppText style={styles.petName}>{activePet.name}</AppText>
            <AppText style={styles.petBreed}>
              {activePet.typeLabel ? `${activePet.typeLabel} · ${activePet.breed}` : activePet.breed}
            </AppText>
          </LinearGradient>

          <View style={styles.avatarWrap}>
            <View style={styles.avatarCard}>
              {activePet.photo ? (
                <Image source={{ uri: activePet.photo }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <PetIcon name={activePet.icon} size={56} color={colors.brown} strokeWidth={1.8} />
              )}
            </View>
          </View>

          <Reveal>
            <View style={styles.statWrap}>
              <View style={[glassCardStrong, styles.statCard]}>
                <View style={[styles.statIcon, { backgroundColor: "#DCE9F5" }]}>
                  <Feather name="droplet" size={20} color="#335C8A" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={styles.statLabel}>น้ำหนักล่าสุด</AppText>
                  <AppText style={styles.statValue}>{latestW != null ? `${latestW} kg` : "—"}</AppText>
                </View>
                <AppText style={styles.statTrend}>{trendText}</AppText>
              </View>
            </View>
          </Reveal>

          <Reveal>
            <View style={styles.grid}>
              {cards.map((c) => (
                <Pressable
                  key={c.title}
                  style={[glassCard, styles.gridCard]}
                  onPress={() => go(c.screen)}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.title}: ${c.status} แตะเพื่อเปิดหน้า ${c.title}`}
                >
                  <View style={[styles.cardIcon, { backgroundColor: c.soft }]}>
                    <Feather name={c.icon} size={22} color={c.deep} />
                  </View>
                  <AppText style={styles.cardTitle}>{c.title}</AppText>
                  <AppText style={[styles.cardStatus, { color: c.deep }]}>{c.status}</AppText>
                </Pressable>
              ))}
            </View>
          </Reveal>

          {/* ---------- Footer tip ---------- */}
          <AppText style={styles.footerTip}>เคล็ดลับ: แตะหมวดหมู่เพื่อบันทึกหรือดูรายการ</AppText>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 56,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(61,35,15,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  agePill: {
    backgroundColor: "rgba(61,35,15,0.35)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  agePillText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  petName: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", marginTop: 12 },
  petBreed: { color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: "500", marginTop: 4 },

  avatarWrap: { alignItems: "center", marginTop: -56 },
  avatarCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadowLg,
  },
  avatarImg: { width: 110, height: 110, borderRadius: 28 },

  statWrap: { marginHorizontal: 20, marginTop: 16 },
  statCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statLabel: { color: colors.textBody, fontSize: 12, fontWeight: "400" },
  statValue: { color: colors.textDark, fontSize: 20, fontWeight: "700" },
  statTrend: { color: "#3E7A50", fontSize: 12, fontWeight: "500" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 18 },
  gridCard: {
    width: "47%",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  cardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardTitle: { color: colors.textDark, fontSize: 15, fontWeight: "600", marginBottom: 4 },
  cardStatus: { fontSize: 12, fontWeight: "400" },
  footerTip: { color: colors.textDark, fontSize: 12, fontWeight: "400", textAlign: "center", marginTop: 18 },
});

export default PetProfileScreen;
