/**
 * การ์ดวิเคราะห์สุขภาพขั้นสูง (ฟีเจอร์ Plus/Premium)
 * วิเคราะห์จากประวัติน้ำหนัก: แนวโน้ม + เทียบช่วงน้ำหนักสุขภาพ + คำแนะนำ
 */
import { View, StyleSheet } from "react-native";
import { Activity, TrendingUp, TrendingDown, Minus, ShieldCheck, ShieldAlert } from "lucide-react-native";

import AppText from "./AppText";
import { colors, radius, shadow } from "../theme";

/** วิเคราะห์ชุดข้อมูลน้ำหนัก -> { trend, inRange, message } */
export function analyzeWeight(entries = [], healthyRange = []) {
  if (entries.length < 2) {
    return { enough: false, message: "บันทึกน้ำหนักอีกอย่างน้อย 2 ครั้งเพื่อเริ่มวิเคราะห์แนวโน้ม" };
  }
  const values = entries.map((e) => (typeof e === "number" ? e : e.value));
  const latest = values[values.length - 1];
  const prev = values[values.length - 2];
  const diff = latest - prev;
  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const [min, max] = healthyRange;
  const inRange = min != null && latest >= min && latest <= max;

  let message;
  if (!inRange) {
    message = latest < min
      ? "น้ำหนักต่ำกว่าช่วงสุขภาพ ควรปรึกษาสัตวแพทย์เรื่องอาหาร"
      : "น้ำหนักเกินช่วงสุขภาพ ควรควบคุมอาหารและเพิ่มการออกกำลังกาย";
  } else if (trend === "up") {
    message = "อยู่ในช่วงสุขภาพแต่น้ำหนักกำลังเพิ่มขึ้น ควรเฝ้าระวังต่อเนื่อง";
  } else if (trend === "down") {
    message = "อยู่ในช่วงสุขภาพและน้ำหนักลดลงเล็กน้อย ดูแลให้คงที่นะ";
  } else {
    message = "น้ำหนักอยู่ในช่วงสุขภาพและนิ่งดี ทำต่อไปได้เลย!";
  }
  return { enough: true, trend, inRange, diff, message };
}

function HealthInsightCard({ entries, healthyRange, petName }) {
  const result = analyzeWeight(entries, healthyRange);
  const TrendIcon = result.trend === "up" ? TrendingUp : result.trend === "down" ? TrendingDown : Minus;
  const RangeIcon = result.inRange ? ShieldCheck : ShieldAlert;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Activity size={16} color={colors.accent} />
        <AppText style={styles.title}>วิเคราะห์สุขภาพขั้นสูง</AppText>
      </View>

      {result.enough ? (
        <>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <TrendIcon size={13} color={colors.brown} />
              <AppText style={styles.badgeText}>
                {result.trend === "up" ? `เพิ่มขึ้น ${result.diff.toFixed(2)} kg` : result.trend === "down" ? `ลดลง ${Math.abs(result.diff).toFixed(2)} kg` : "นิ่ง"}
              </AppText>
            </View>
            <View style={styles.badge}>
              <RangeIcon size={13} color={result.inRange ? colors.greenDark : colors.red} />
              <AppText style={[styles.badgeText, !result.inRange && { color: colors.red }]}>
                {result.inRange ? "อยู่ในช่วงสุขภาพ" : "นอกช่วงสุขภาพ"}
              </AppText>
            </View>
          </View>
          <AppText style={styles.message}>{result.message}</AppText>
        </>
      ) : (
        <AppText style={styles.message}>{result.message}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(168,85,46,0.2)",
    padding: 14,
    marginTop: 12,
    ...shadow,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: "700", color: colors.textDark },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.cardTanBg,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: colors.brown },
  message: { fontSize: 12, color: colors.textBody, lineHeight: 18 },
});

export default HealthInsightCard;
