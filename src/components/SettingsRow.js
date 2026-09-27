/** แถวรายการตั้งค่า — วาดไอคอนด้วย lucide ผ่าน iconMap */
import { View, Pressable, StyleSheet } from "react-native";

import { colors } from "../theme";
import AppText from "./AppText";
import { resolveIcon } from "./iconMap";

export default function SettingsRow({ icon, label, onPress, danger, right, dim }) {
  const IconComp = resolveIcon(icon);
  return (
    <Pressable
      onPress={onPress}
      // pressed feedback + แถว "เร็ว ๆ นี้" จางลง (dim)
      style={({ pressed }) => [styles.settingsRow, dim && styles.settingsRowDim, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
    >
      <View style={[styles.settingsIconWrap, danger && { backgroundColor: "#FBE4E0" }]}>
        {IconComp ? <IconComp size={18} color={danger ? colors.red : colors.brown} strokeWidth={2} /> : null}
      </View>
      <AppText style={[styles.settingsLabel, danger && { color: colors.red }]}>{label}</AppText>
      {right ? right : <ChevronRightFallback />}
    </Pressable>
  );
}

function ChevronRightFallback() {
  const IconComp = resolveIcon("chevron-right");
  return <IconComp size={18} color={colors.textGray} strokeWidth={2} />;
}

const styles = StyleSheet.create({
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.cardTanBg,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textDark },
  // ฟีเจอร์ที่ยังไม่พร้อมใช้ — จางลงครึ่งหนึ่ง
  settingsRowDim: { opacity: 0.5 },
});
