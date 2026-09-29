/** การ์ดนัดหมาย **/
import { View, Pressable, StyleSheet } from "react-native";
import { Calendar, MapPin, Check } from "lucide-react-native";

import { colors, category } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { formatDate } from "../utils/date";
import Card from "./Card";
import IconButton from "./IconButton";
import AppText from "./AppText";
import { Badge } from "./ui";

/** คืน "วันนี้"/"พรุ่งนี้" ถ้า dateObj ตรงกัน ไม่ใช่คืน null */
function dayLabel(dateObj) {
  if (!dateObj) return null;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diff = Math.round((target - startToday) / 86400000);
  if (diff === 0) return "วันนี้";
  if (diff === 1) return "พรุ่งนี้";
  return null;
}

export default function AppointmentCard({ data, petName, onDelete, onEdit, onMarkDone, status }) {
  const isDone = (status || data.status) === "done";
  const dayTag = dayLabel(data.dateObj);
  // ไอคอนหมวดเดิมใช้ Feather ตามชื่อใน data.icon (ฟอร์มส่ง "calendar", db อาจไม่มีค่า) — ใช้ปฏิทินเป็นหลัก
  const TitleIcon = Calendar;

  return (
    <Card style={[styles.apptCard, isDone && styles.doneCard]}>
      {/* แถวบน: ไอคอน + ข้อความ (flex:1) + วันเวลา — ไม่มีปุ่มแย่งพื้นที่ กันข้อความถูกบีบเหลือ 0 บนจอแคบ */}
      <View style={styles.topRow}>
        <View style={[sharedStyles.iconWrap, { backgroundColor: category.appointments.soft }]}>
          <TitleIcon size={20} color={category.appointments.main} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={styles.titleRow}>
            <AppText style={styles.apptTitle}>{data.title}</AppText>
            {isDone && <Badge variant="success" style={styles.dayBadge}>มาแล้ว</Badge>}
          </View>
          {petName ? <AppText style={styles.apptPet}>{petName}</AppText> : null}
          {data.location ? (
            <View style={styles.apptSubRow}>
              <MapPin size={13} color={colors.textGray} strokeWidth={2} />
              <AppText style={styles.apptSub}>{data.location}</AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.dateCol}>
          <AppText style={styles.apptDate}>{formatDate(data.dateObj)}</AppText>
          <AppText style={styles.apptTime}>{data.time}</AppText>
          {dayTag && !isDone && (
            <Badge variant={dayTag === "วันนี้" ? "default" : "secondary"} style={styles.dayBadge} textStyle={styles.dayBadgeText}>
              {dayTag}
            </Badge>
          )}
        </View>
      </View>

      {/* แถวล่าง: ปุ่มทั้งหมดชิดขวา — แยกจากข้อความเพื่อไม่ให้จอแคบบีบข้อความ */}
      {(onMarkDone && !isDone) || (onEdit && !isDone) || (onDelete && !isDone) ? (
        <View style={styles.actionsRow}>
          {onMarkDone && !isDone && (
            <Pressable
              onPress={onMarkDone}
              accessibilityRole="button"
              accessibilityLabel="ทำเครื่องหมายว่ามาแล้ว"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.85 }]}
            >
              <Check size={13} color={colors.success} strokeWidth={2} />
              <AppText style={styles.doneBtnText}>มาแล้ว</AppText>
            </Pressable>
          )}
          {onEdit && !isDone && (
            <IconButton
              icon="edit-2"
              color={colors.accentDeep}
              onPress={onEdit}
              accessibilityLabel={`แก้ไขนัดหมาย ${data.title}`}
            />
          )}
          {onDelete && !isDone && (
            <IconButton icon="trash-2" color={colors.red} onPress={onDelete} accessibilityLabel={`ลบนัดหมาย ${data.title}`} />
          )}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  apptCard: { marginBottom: 14, paddingVertical: 14, paddingHorizontal: 16 },
  doneCard: { opacity: 0.55 },
  topRow: { flexDirection: "row", alignItems: "center" },
  dateCol: { alignItems: "flex-end", marginLeft: 10 },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.trackBg },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  apptTitle: { fontSize: 16, fontWeight: "600", color: colors.textDark, flexShrink: 1 },
  apptPet: { fontSize: 13, fontWeight: "600", color: colors.textGray, marginTop: 2 },
  apptSubRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  apptSub: { fontSize: 13, fontWeight: "400", color: colors.textGray, flexShrink: 1 },
  apptDate: { fontSize: 14, fontWeight: "400", color: colors.brown },
  apptTime: { fontSize: 13, fontWeight: "400", color: colors.textGray, marginTop: 4 },
  dayBadge: { marginTop: 4, paddingVertical: 2, paddingHorizontal: 8 },
  dayBadgeText: { fontSize: 11 },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.trackBg,
  },
  doneBtnText: { fontSize: 12, fontWeight: "600", color: colors.success },
});
