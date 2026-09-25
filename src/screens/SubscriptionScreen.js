/** หน้าแพ็กเกจสมาชิก: เปรียบเทียบ 3 แพ็กเกจ + สมัคร (ชำระเงินจำลอง) / ยกเลิก */
import { useState } from "react";
import { SafeAreaView, View, Pressable, StyleSheet } from "react-native";
import { Check, Crown } from "lucide-react-native";

import AppText from "../components/AppText";
import Header from "../components/Header";
import AnimatedScrollView from "../components/AnimatedScrollView";
import { Button } from "../components/ui";
import { colors, radius, shadow } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { SUBSCRIPTION_PLANS } from "../data/constants";
import { confirmDialog } from "../utils/confirm";

const BADGE_BY_TIER = {
  standard: { text: "แพ็กเกจฟรี", color: colors.textGray },
  plus: { text: "แพ็กเกจยอดนิยม", color: colors.accent },
  premium: { text: "ดีที่สุด", color: colors.greenDark },
};

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

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title="แพ็กเกจของฉัน" onBack={() => go("back")} />
      <AnimatedScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.currentCard}>
          <Crown size={18} color={colors.greenDark} />
          <AppText style={styles.currentLabel}>
            แพ็กเกจปัจจุบัน: <AppText style={styles.currentTier}>{tier.toUpperCase()}</AppText>
          </AppText>
          <AppText style={styles.currentMeta}>
            สัตว์เลี้ยงในระบบ {petCount} ตัว
          </AppText>
          {tier !== "standard" && (
            <Button title="ยกเลิกสมาชิก" variant="ghost" size="sm" onPress={cancelCurrent} style={styles.cancelBtn} />
          )}
        </View>

        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.key === tier;
          const badge = BADGE_BY_TIER[plan.key];
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
              <AppText style={styles.planPrice}>{plan.priceLabel}</AppText>
              <AppText style={styles.planTagline}>{plan.tagline}</AppText>
              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Check size={13} color={colors.greenDark} />
                  <AppText style={styles.featureText}>{f}</AppText>
                </View>
              ))}
              <View pointerEvents="none">
                <Button
                  title={busy === plan.key ? "กำลังดำเนินการ..." : isCurrent ? "แพ็กเกจปัจจุบันของคุณ" : plan.price === 0 ? "เปลี่ยนเป็นฟรี" : `สมัคร ${plan.priceLabel}`}
                  variant={isCurrent ? "secondary" : plan.key === "standard" ? "outline" : "default"}
                  disabled={isCurrent || Boolean(busy)}
                  style={styles.planBtn}
                />
              </View>
            </>
          );

          // การ์ดที่ไม่ใช่แพ็กเกจปัจจุบัน = กดได้ทั้งใบ (hover บนเว็บ / กดค้างบนมือถือ)
          if (isCurrent) {
            return (
              <View key={plan.key} style={[styles.planCard, styles.planCardCurrent]}>
                {content}
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
                hovered && styles.planCardHover,
                pressed && styles.planCardPressed,
              ]}
            >
              {content}
            </Pressable>
          );
        })}

      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  currentCard: {
    backgroundColor: colors.cardTanBg,
    borderRadius: radius.md,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
    ...shadow,
  },
  currentLabel: { fontSize: 14, color: colors.textBody },
  currentTier: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  currentMeta: { fontSize: 12, color: colors.textGray, width: "100%" },
  cancelBtn: { alignSelf: "flex-end", marginTop: 2 },
  planCard: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  planCardCurrent: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF" },
  planHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  planName: { fontSize: 18, fontWeight: "700", color: colors.textDark },
  planPrice: { fontSize: 15, fontWeight: "700", color: colors.accent, marginBottom: 4 },
  planTagline: { fontSize: 12, color: colors.textGray, marginTop: 4, marginBottom: 10 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 6 },
  featureText: { fontSize: 12, color: colors.textBody, flex: 1, lineHeight: 18 },
  planBtn: { width: "100%", marginTop: 10 },
  planCardHover: {
    borderColor: colors.accent,
    backgroundColor: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    ...shadow,
  },
  planCardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  note: { fontSize: 11, color: colors.textGray, textAlign: "center", marginTop: 6, lineHeight: 17 },
});

export default SubscriptionScreen;
