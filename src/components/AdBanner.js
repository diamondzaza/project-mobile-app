/**
 * แบนเนอร์โฆษณา/ข้อความส่งเสริมตามแพ็กเกจ
 * - level "banner": แบนเนอร์โฆษณา (Standard) — ปิดชั่วคราวได้ต่อ session
 * - level "promo": แถบข้อความส่งเสริมการขายบาง ๆ (Plus)
 * หมายเหตุ: ตอนนี้เป็น placeholder — โฆษณาจริง (AdMob) ดู CONFIG-NEEDED.md
 */
import { useState } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { X, Megaphone, Sparkles } from "lucide-react-native";

import AppText from "./AppText";
import { colors, radius, glass } from "../theme";

function AdBanner({ level = "banner", onPressUpgrade }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  if (level === "promo") {
    return (
      <Pressable
        style={({ pressed }) => [styles.promoStrip, pressed && { opacity: 0.85 }]}
        onPress={onPressUpgrade}
        accessibilityRole="button"
        accessibilityLabel="โปรโมชัน อัปเกรดแพ็กเกจ"
      >
        <Sparkles size={14} color={colors.brown} />
        <AppText style={styles.promoText}>ลองวิเคราะห์สุขภาพขั้นสูง + ไม่มีโฆษณา กับแพ็กเกจ Premium</AppText>
      </Pressable>
    );
  }

  // banner (Standard) — พื้น glass น้ำหนักต่ำกว่า content หลัก แยกให้รู้ว่าเป็นโฆษณา
  return (
    <View>
      <View style={styles.bannerWrap}>
        <Pressable
          style={({ pressed }) => [styles.banner, pressed && { opacity: 0.85 }]}
          onPress={onPressUpgrade}
          accessibilityRole="button"
          accessibilityLabel="พื้นที่โฆษณา แตะเพื่อดูแพ็กเกจปลดล็อกโฆษณา"
        >
          <Megaphone size={18} color={colors.accentDeep} />
          <View style={{ flex: 1 }}>
            <AppText style={styles.bannerTitle}>พื้นที่โฆษณา</AppText>
            <AppText style={styles.bannerText}>อัปเกรดแพ็กเกจเพื่อปลดล็อกโหมดไร้โฆษณา</AppText>
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
          onPress={() => setClosed(true)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="ปิดโฆษณาชั่วคราว"
        >
          <X size={14} color={colors.textGray} />
        </Pressable>
      </View>
      <AppText style={styles.closedNote}>ปิดชั่วคราว — จะแสดงอีกในครั้งถัดไป</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
    ...glass.surface,
    // ขอบ accentDeep จาง (ค่าเดียวกับ colors.accentDeep ที่ opacity 0.35)
    borderColor: "rgba(168,85,46,0.35)",
  },
  banner: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  bannerTitle: { fontSize: 13, fontWeight: "700", color: colors.textBody },
  bannerText: { fontSize: 11, color: colors.textGray, marginTop: 2 },
  closedNote: { fontSize: 12, fontWeight: "400", color: colors.textGray, marginTop: 4, textAlign: "right" },
  closeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  promoStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(168,85,46,0.25)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  promoText: { fontSize: 11, fontWeight: "600", color: colors.brown },
});

export default AdBanner;
