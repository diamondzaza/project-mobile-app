/** หน้าแพ็กเกจสมาชิก: ตารางเปรียบเทียบ + การ์ด 3 แพ็กเกจ (ชำระเงินจำลอง) / ยกเลิก */
import { useState } from "react";
import { SafeAreaView, View, Pressable, StyleSheet, Alert } from "react-native";
import { Check, X, Info, Crown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import AppText from "../components/AppText";
import Header from "../components/Header";
import AnimatedScrollView from "../components/AnimatedScrollView";
import { Button } from "../components/ui";
import { colors, radius, shadow, tierTint } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { SUBSCRIPTION_PLANS } from "../data/constants";
import { confirmDialog } from "../utils/confirm";

// สี badge ผ่าน WCAG AA (contrast กับขาว ≥ 4.5:1) และขนาดอ่านง่าย
const BADGE_BY_TIER = {
  plus: { text: "แพ็กเกจยอดนิยม", color: "#8A4A2B" },
  premium: { text: "ดีที่สุด", color: "#7A5C1E" },
};

// ตารางเปรียบเทียบฟีเจอร์หลัก (แถวละ 1 ฟีเจอร์, 3 คอลัมน์ = ลำดับเดียวกับ SUBSCRIPTION_PLANS)
const COMPARISON = [
  { label: "สัตว์เลี้ยงสูงสุด", values: ["2 ตัว", "6 ตัว", "ไม่จำกัด"] },
  { label: "วิเคราะห์สุขภาพขั้นสูง", values: [false, true, true] },
  { label: "เตือนนัดหมายล่วงหน้า 5 วัน", values: [false, true, true] },
  { label: "ประวัติไม่จำกัด", values: [false, false, true] },
  { label: "ไม่มีโฆษณา", values: [false, true, true] },
];

/** พื้นการ์ดแพ็กเกจ — วาด gradient เมื่อ tierTint กำหนดค่าไว้ (Plus = เงิน, Premium = ทอง) ไม่งั้นใช้สีทึบ */
function PlanSurface({ tint, children }) {
  if (tint.gradient) {
    return (
      <LinearGradient
        colors={tint.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.planSurface}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.planSurface, { backgroundColor: tint.bg }]}>{children}</View>;
}

function SubscriptionScreen({ go, tier, petCount, onActivate, onCancel }) {
  const [busy, setBusy] = useState(null); // tier ที่กำลัง "ชำระเงิน"

  const choose = (plan) => {
    if (busy || plan.key === tier) return;
    confirmDialog({
      title: `สมัครแพ็กเกจ ${plan.label}`,
      message:
        plan.price === 0
          ? "ยืนยันเปลี่ยนกลับไปใช้แพ็กเกจฟรี?"
          : `ยืนยันชำระเงิน ${plan.priceLabel} (โหมดจำลอง — ระบบจะเปิดใช้แพ็กเกจทันที)?`,
      confirmText: plan.price === 0 ? "เปลี่ยน" : "ยืนยันชำระเงิน",
      destructive: plan.price === 0 && plan.key === "standard",
      onConfirm: async () => {
        setBusy(plan.key);
        await onActivate(plan.key);
        setBusy(null);
      },
    });
  };

  const cancelCurrent = () =>
    confirmDialog({
      title: "ยกเลิกสมาชิก",
      message: "ยกเลิกแล้วจะกลับไปใช้แพ็กเกจ Standard ทันที ต้องการยกเลิกหรือไม่?",
      confirmText: "ยกเลิกสมาชิก",
      destructive: true,
      onConfirm: onCancel,
    });

  const showNoteInfo = (f) => Alert.alert("รายละเอียด", f.info || f.text);

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="แพ็กเกจของฉัน" onBack={() => go("back")} />
      <AnimatedScrollView contentContainerStyle={styles.scroll}>
        {/* สรุปสั้นบนสุด (แทนแบนเนอร์เดิม) */}
        <AppText style={styles.petCountLine}>
          สัตว์เลี้ยงในระบบ {petCount} ตัว
        </AppText>

        {/* ตารางเปรียบเทียบฟีเจอร์หลัก */}
        <View style={styles.compareCard}>
          <View style={styles.compareRow}>
            <AppText style={styles.compareLabel}>ฟีเจอร์</AppText>
            {SUBSCRIPTION_PLANS.map((p) => (
              <AppText
                key={p.key}
                style={[styles.compareColHead, p.key === tier && styles.compareColCurrent]}
              >
                {p.label}
              </AppText>
            ))}
          </View>
          {COMPARISON.map((row) => (
            <View key={row.label} style={styles.compareRow}>
              <AppText style={styles.compareLabel}>{row.label}</AppText>
              {row.values.map((v, i) => (
                <View
                  key={i}
                  style={[styles.compareCell, SUBSCRIPTION_PLANS[i].key === tier && styles.compareCellCurrent]}
                >
                  {typeof v === "string" ? (
                    <AppText style={styles.compareValue}>{v}</AppText>
                  ) : v ? (
                    <Check size={14} color={colors.greenDark} />
                  ) : (
                    <X size={14} color={colors.textGray} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* การ์ดรายละเอียดแต่ละแพ็กเกจ */}
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.key === tier;
          const badge = BADGE_BY_TIER[plan.key];
          const tint = tierTint[plan.key];
          const content = (
            <>
              <View style={styles.planHead}>
                <AppText style={styles.planName}>{plan.label}</AppText>
                {badge && !isCurrent && (
                  <View style={[styles.badge, { backgroundColor: badge.color }]}>
                    <AppText style={styles.badgeText}>{badge.text}</AppText>
                  </View>
                )}
              </View>
              {/* ราคา: ขนาด/น้ำหนักเดียวกันทุกการ์ด เพื่อเทียบสายตา */}
              <AppText style={styles.planPrice}>{plan.priceLabel}</AppText>
              <AppText style={styles.planTagline}>{plan.tagline}</AppText>
              <View style={styles.featureList}>
                {plan.features.map((f) =>
                  f.note ? (
                    <Pressable
                      key={f.text}
                      style={({ pressed }) => [styles.featureRow, styles.featureNoteRow, pressed && { opacity: 0.85 }]}
                      onPress={() => showNoteInfo(f)}
                      hitSlop={{ top: 3, bottom: 3 }}
                      accessibilityRole="button"
                      accessibilityLabel={`${f.text} แตะเพื่อดูรายละเอียด`}
                    >
                      <Info size={13} color={colors.textGray} />
                      <AppText style={[styles.featureText, styles.featureNoteText]}>{f.text}</AppText>
                    </Pressable>
                  ) : (
                    <View key={f.text} style={styles.featureRow}>
                      <Check size={13} color={colors.greenDark} />
                      <AppText style={styles.featureText}>{f.text}</AppText>
                    </View>
                  )
                )}
              </View>
              {/* CTA เฉพาะการ์ดที่ยังไม่ใช่แพ็กเกจปัจจุบัน (ปัจจุบันมี ribbon แทนแล้ว) */}
              {!isCurrent && (
                <>
                  <View pointerEvents="none">
                    <Button
                      title={
                        busy === plan.key
                          ? "กำลังดำเนินการ..."
                          : plan.price === 0
                            ? "เปลี่ยนเป็นฟรี"
                            : `สมัคร ${plan.priceLabel}`
                      }
                      variant={plan.key === "standard" ? "outline" : "default"}
                      disabled={Boolean(busy)}
                      style={styles.planBtn}
                    />
                  </View>
                  {plan.price > 0 && (
                    <AppText style={styles.trustText}>ยกเลิกได้ทุกเมื่อ ไม่มีค่าใช้จ่ายแอบแฝง</AppText>
                  )}
                </>
              )}
            </>
          );

          if (isCurrent) {
            return (
              <View key={plan.key} style={[styles.planCard, { borderColor: tint.border, borderWidth: 2 }]}>
                {/* ribbon สถานะปัจจุบัน มุมขวาบน */}
                <View style={styles.ribbon}>
                  <Crown size={12} color={colors.white} />
                  <AppText style={styles.ribbonText}>แพ็กเกจปัจจุบันของคุณ</AppText>
                </View>
                <PlanSurface tint={tint}>{content}</PlanSurface>
              </View>
            );
          }
          return (
            <Pressable
              key={plan.key}
              onPress={() => choose(plan)}
              disabled={Boolean(busy)}
              accessibilityRole="button"
              accessibilityLabel={`สมัครแพ็กเกจ ${plan.label} ${plan.priceLabel}`}
              style={({ hovered, pressed }) => [
                styles.planCard,
                { borderColor: tint.border, borderWidth: 1 },
                hovered && styles.planCardHover,
                pressed && styles.planCardPressed,
              ]}
            >
              <PlanSurface tint={tint}>{content}</PlanSurface>
            </Pressable>
          );
        })}

        {tier !== "standard" && (
          <Button title="ยกเลิกสมาชิก" variant="ghost" size="sm" onPress={cancelCurrent} style={styles.cancelBtn} />
        )}
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32 },
  petCountLine: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textBody,
    textAlign: "center",
    // ระยะห่างจาก Header บน และเว้นล่างก่อนถึงตาราง — เดิมไม่มี paddingTop ทำให้ติด Header
    paddingVertical: 6,
    marginBottom: 8,
  },
  /* ตารางเปรียบเทียบ (mobile-first ~390px) */
  compareCard: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  compareRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  compareLabel: { flex: 1, fontSize: 12, color: colors.textBody, fontWeight: "600" },
  compareColHead: { width: 64, fontSize: 12, fontWeight: "700", color: colors.textDark, textAlign: "center" },
  compareColCurrent: { color: colors.accent },
  compareCell: { width: 64, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, paddingVertical: 2 },
  compareCellCurrent: { backgroundColor: "rgba(201,123,90,0.15)" },
  compareValue: { fontSize: 12, fontWeight: "700", color: colors.textDark },
  /* การ์ดแพ็กเกจ */
  planCard: { marginBottom: 20, borderRadius: radius.md, borderWidth: 1, borderColor: "transparent" },
  planSurface: { borderRadius: radius.md, padding: 16 },
  ribbon: {
    position: "absolute",
    top: -11,
    right: 12,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#8A4A2B",
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...shadow,
  },
  ribbonText: { fontSize: 12, fontWeight: "700", color: colors.white },
  planHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  planName: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  badge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "700", color: colors.white },
  planPrice: { fontSize: 18, fontWeight: "700", color: colors.accent, marginBottom: 4 },
  planTagline: { fontSize: 12, color: colors.textGray, marginTop: 2, marginBottom: 10 },
  featureList: { minHeight: 134 }, // ความสูงเท่ากันทุกการ์ด แม้จำนวนฟีเจอร์ต่างกัน (รองรับแถว note ที่มี padding เพิ่ม)
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 6 },
  // แถวที่แตะดูรายละเอียดได้ — สูงขึ้นให้แตะสบาย
  featureNoteRow: { paddingVertical: 10, marginBottom: 2 },
  trustText: { fontSize: 12, fontWeight: "400", color: colors.textGray, textAlign: "center", marginTop: 6 },
  featureText: { fontSize: 12, color: colors.textBody, flex: 1, lineHeight: 18 },
  featureNoteText: { color: colors.textGray },
  planBtn: { width: "100%", marginTop: 10 },
  planCardHover: { borderColor: colors.accent, cursor: "pointer" },
  planCardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  cancelBtn: { alignSelf: "center", marginTop: 4 },
});

export default SubscriptionScreen;
