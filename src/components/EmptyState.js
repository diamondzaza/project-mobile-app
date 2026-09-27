/** สถานะว่าง — วาดด้วย lucide ผ่าน iconMap (รับชื่อเดิมหรือ component ก็ได้) */
import { View, StyleSheet } from "react-native";
import { PawPrint } from "lucide-react-native";

import { colors } from "../theme";
import AppText from "./AppText";
import Button from "./ui/button";
import { resolveIcon } from "./iconMap";

const CATEGORY_MAP = {
  food: { icon: "coffee", message: "ยังไม่มีรายการอาหาร" },
  activity: { icon: "activity", message: "ยังไม่มีกิจกรรม" },
  notes: { icon: "file-text", message: "ยังไม่มีโน้ต" },
  health: { icon: "heart", message: "ยังไม่มีข้อมูลที่นี่" },
  appointments: { icon: "calendar", message: "ไม่มีนัดหมาย" },
  weight: { icon: "bar-chart-2", message: "ยังไม่มีข้อมูลน้ำหนัก" },
  notifications: { icon: "bell", message: "ไม่มีการแจ้งเตือน" },
};

export default function EmptyState({ category, icon, message, action }) {
  const c = CATEGORY_MAP[category] || {};
  const iconName = icon || c.icon;
  const msg = message || c.message || "ยังไม่มีข้อมูลที่นี่";
  const IconComp = resolveIcon(iconName);
  return (
    <View style={styles.wrap}>
      {IconComp ? (
        <IconComp size={40} color={colors.brown} strokeWidth={1.8} style={styles.icon} />
      ) : (
        <PawPrint size={40} color={colors.brown} strokeWidth={1.8} style={styles.icon} />
      )}
      <AppText style={styles.message}>{msg}</AppText>
      {action?.label && action?.onPress && (
        <Button title={action.label} onPress={action.onPress} variant="secondary" size="sm" style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 28 },
  icon: { marginBottom: 10 },
  message: { color: colors.textGray, fontSize: 14, fontWeight: "400", textAlign: "center" },
  action: { marginTop: 14 },
});
