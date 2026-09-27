/**
 * การ์ดวิเคราะห์สุขภาพขั้นสูง (ฟีเจอร์ Plus/Premium)
 * วิเคราะห์จากประวัติน้ำหนัก: แนวโน้ม + เทียบช่วงน้ำหนักสุขภาพ + คำแนะนำ
 */
import { View, StyleSheet } from "react-native";
import { Activity, TrendingUp, TrendingDown, Minus, ShieldCheck, ShieldAlert } from "lucide-react-native";

import AppText from "./AppText";
import { colors, radius, shadow } from "../theme";

/** ค่าเฉลี่ย (ใช้กับแนวโน้มระยะยาว) */
const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;

/** วิเคราะห์ชุดข้อมูลน้ำหนัก -> { trend, inRange, longTrend, message }
 *  trend = เทียบ 2 ค่าล่าสุด (ระยะสั้น), longTrend = เทียบค่าเฉลี่ยครึ่งแรก vs ครึ่งหลัง (ระยะยาว)
 *  ระยะยาวต้องมี >= 4 ค่าจึงคำนวณ (ครึ่งละ 2) — น้อยกว่านั้นสัญญาณไม่น่าเชื่อถือ */
export function analyzeWeight(entries = [], healthyRange = []) {
  if (entries.length < 2) {
    return { enough: false, message: "บันทึกน้ำหนักอีกอย่างน้อย 2 ครั้งเพื่อเริ่มวิเคราะห์แนวโน้ม" };
  }
  const values = entries.map((e) => (typeof e === "number" ? e : e.value));
  const latest = values[values.length - 1];
  const prev = values[values.length - 2];
  const diff = latest - prev;
  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "flat";
  const [min, max] = healthyRange || [];
  const hasRange = min != null && max != null;
  // ไม่มีช่วงอ้างอิง -> inRange เป็น null (ไม่ตัดสินว่าอยู่นอกช่วง)
  const inRange = hasRange ? latest >= min && latest <= max : null;

  // แนวโน้มระยะยาว — threshold กันสัญญาณรบกวน: อย่างน้อย 0.1 kg หรือ 2% ของค่าเฉลี่ยครึ่งแรก
  let longTrend = null;
  let longDiff = null;
  if (values.length >= 4) {
    const mid = Math.floor(values.length / 2);
    const firstAvg = avg(values.slice(0, mid));
    const lastAvg = avg(values.slice(mid));
    longDiff = lastAvg - firstAvg;
    const threshold = Math.max(0.1, Math.abs(firstAvg) * 0.02);
    longTrend = longDiff > threshold ? "up" : longDiff < -threshold ? "down" : "flat";
  }

  let message;
  if (hasRange && inRange === false) {
    if (latest < min) {
      message = longTrend === "down"
        ? "น้ำหนักต่ำกว่าช่วงสุขภาพและลดลงต่อเนื่อง ควรปรึกษาสัตวแพทย์โดยเร็ว"
        : "น้ำหนักต่ำกว่าช่วงสุขภาพ ควรปรึกษาสัตวแพทย์เรื่องอาหาร";
    } else {
      message = longTrend === "up"
        ? "น้ำหนักเกินช่วงสุขภาพและยังเพิ่มขึ้นต่อเนื่อง ควรปรึกษาสัตวแพทย์เร็วนี้"
        : "น้ำหนักเกินช่วงสุขภาพ ควรควบคุมอาหารและเพิ่มการออกกำลังกาย";
    }
  } else if (longTrend === "up") {
    message = trend === "up"
      ? "อยู่ในช่วงสุขภาพแต่แนวโน้มระยะยาวเพิ่มขึ้นชัดเจน ควรคุมอาหารและเพิ่มเวลาเล่น"
      : "อยู่ในช่วงสุขภาพ แต่แนวโน้มระยะยาวค่อยๆ เพิ่มขึ้น ควรเฝ้าระวังต่อเนื่อง";
  } else if (longTrend === "down") {
    message = "แนวโน้มระยะยาวลดลงเล็กน้อย — ถ้าตั้งใจลดน้ำหนักถือว่ากำลังไปดี ระวังอย่าให้ต่ำกว่าช่วงสุขภาพ";
  } else if (trend === "up") {
    message = "อยู่ในช่วงสุขภาพแต่น้ำหนักกำลังเพิ่มขึ้น ควรเฝ้าระวังต่อเนื่อง";
  } else if (trend === "down") {
    message = "อยู่ในช่วงสุขภาพและน้ำหนักลดลงเล็กน้อย ดูแลให้คงที่นะ";
  } else {
    message = "น้ำหนักอยู่ในช่วงสุขภาพและนิ่งดี ทำต่อไปได้เลย!";
  }
  return { enough: true, trend, inRange, diff, longTrend, longDiff, message };
}

function HealthInsightCard({ entries, healthyRange, petName }) {
  const result = analyzeWeight(entries, healthyRange);
  const TrendIcon = result.trend === "up" ? TrendingUp : result.trend === "down" ? TrendingDown : Minus;
  const LongTrendIcon = result.longTrend === "up" ? TrendingUp : result.longTrend === "down" ? TrendingDown : Minus;
  const RangeIcon = result.inRange ? ShieldCheck : ShieldAlert;
  // ป้าย trend ใช้เกณฑ์สีเดียวกับป้ายช่วงสุขภาพ — แดงเมื่อนอกช่วง, กลางเมื่อไม่มีข้อมูลช่วง
  const outOfRange = result.inRange === false;
  const trendColor = outOfRange ? colors.danger : colors.brown;
  const longLabel =
    result.longTrend === "up"
      ? `ยาว: เพิ่มขึ้น ${result.longDiff.toFixed(2)} kg`
      : result.longTrend === "down"
        ? `ยาว: ลดลง ${Math.abs(result.longDiff).toFixed(2)} kg`
        : "ยาว: นิ่ง";

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
              <TrendIcon size={13} color={trendColor} />
              <AppText style={[styles.badgeText, outOfRange && { color: colors.danger }]}>
                {result.trend === "up" ? `เพิ่มขึ้น ${result.diff.toFixed(2)} kg` : result.trend === "down" ? `ลดลง ${Math.abs(result.diff).toFixed(2)} kg` : "นิ่ง"}
              </AppText>
            </View>
            {result.inRange != null && (
              <View style={styles.badge}>
                <RangeIcon size={13} color={result.inRange ? colors.greenDark : colors.danger} />
                <AppText style={[styles.badgeText, !result.inRange && { color: colors.danger }]}>
                  {result.inRange ? "อยู่ในช่วงสุขภาพ" : "นอกช่วงสุขภาพ"}
                </AppText>
              </View>
            )}
            {result.longTrend != null && (
              <View style={styles.badge}>
                <LongTrendIcon size={13} color={colors.brown} />
                <AppText style={styles.badgeText}>{longLabel}</AppText>
              </View>
            )}
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
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.brown },
  message: { fontSize: 13, color: colors.textBody, lineHeight: 20 },
});

export default HealthInsightCard;
