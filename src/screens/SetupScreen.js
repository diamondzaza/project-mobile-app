/** หน้าแจ้งว่ายังไม่ได้ตั้งค่า Supabase — แสดงแทน mock mode เมื่อไม่มี .env */
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Settings, Database, KeyRound } from "lucide-react-native";

import AppText from "../components/AppText";
import AnimatedScrollView from "../components/AnimatedScrollView";
import { Card, CardContent } from "../components/ui";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";

const STEPS = [
  {
    icon: Database,
    title: "1. รัน SQL migration",
    body: "เปิด Supabase Dashboard → SQL Editor → paste เนื้อหาไฟล์ supabase/migrations/0001_init.sql แล้วกด Run (และ 0002_reminders.sql ถ้าต้องการแจ้งเตือน server-side)",
  },
  {
    icon: KeyRound,
    title: "2. สร้างไฟล์ .env",
    body: "ที่ root ของโปรเจกต์ สร้าง .env แล้วใส่ EXPO_PUBLIC_SUPABASE_URL และ EXPO_PUBLIC_SUPABASE_ANON_KEY จาก Project Settings → API",
  },
  {
    icon: Settings,
    title: "3. รีสตาร์ท dev server",
    body: "หยุดแล้วรัน npm start ใหม่ (Expo อ่าน .env ตอน start เท่านั้น)",
  },
];

export default function SetupScreen() {
  return (
    <SafeAreaView style={sharedStyles.container}>
      <AnimatedScrollView contentContainerStyle={styles.scrollContent}>
        <AppText style={styles.title}>ยังไม่ได้ตั้งค่าฐานข้อมูล</AppText>
        <AppText style={styles.subtitle}>
          แอปนี้ใช้ Supabase เป็นฐานข้อมูลและระบบล็อกอิน ทำตาม 3 ขั้นตอนด้านล่างเพื่อเริ่มใช้งาน
        </AppText>

        {STEPS.map((s) => (
          <Card key={s.title} style={styles.card}>
            <CardContent style={styles.cardContent}>
              <View style={styles.iconWrap}>
                <s.icon size={22} color={colors.accent} />
              </View>
              <AppText style={styles.stepTitle}>{s.title}</AppText>
              <AppText style={styles.stepBody}>{s.body}</AppText>
            </CardContent>
          </Card>
        ))}
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textDark, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.textGray, textAlign: "center", marginTop: 8, marginBottom: 24 },
  card: { marginBottom: 12 },
  cardContent: { paddingTop: 16 },
  iconWrap: { alignSelf: "center", marginBottom: 10 },
  stepTitle: { fontSize: 16, fontWeight: "700", color: colors.textDark, textAlign: "center" },
  stepBody: { fontSize: 13, color: colors.textBody, textAlign: "center", marginTop: 6, lineHeight: 20 },
});
