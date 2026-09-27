/** หน้าจอบันทึกน้ำหนัก — กราฟแนวโน้ม + บันทึก (upsert ตามวันที่) + ประวัติทั้งหมดแก้ไข/ลบได้ */
import { useState } from "react";
import { SafeAreaView, View, TextInput, StyleSheet } from "react-native";

import AppText from "../components/AppText";
import Header from "../components/Header";
import Card from "../components/Card";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import IconButton from "../components/IconButton";
import RealCalendar from "../calendar/RealCalendar";
import SimpleLineChart from "../calendar/SimpleLineChart";
import { Card as ShadCard, CardHeader, CardTitle, CardContent, Badge } from "../components/ui";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { formatGregorian, formatGregorianShort } from "../utils/date";
import { confirmDelete } from "../utils/confirm";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

function WeightScreen({ go, activePet, weightData, saveWeightEntry, removeWeightEntry }) {
  const data = (weightData[activePet.id] || [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestWeight = data.length ? data[data.length - 1].value : "—";
  const prevWeight = data.length > 1 ? data[data.length - 2].value : "—";
  const [newWeight, setNewWeight] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  // โหมดแก้ไข — เก็บวันที่ของรายการที่กำลังแก้ (บันทึก = upsert ทับวันนั้น)
  const [editingDate, setEditingDate] = useState(null);

  const trend =
    data.length > 1
      ? data[data.length - 1].value > data[data.length - 2].value
        ? "up"
        : data[data.length - 1].value < data[data.length - 2].value
        ? "down"
        : "steady"
      : null;

  const [min, max] = activePet.healthyRange || [];
  const hasRange = typeof min === "number" && typeof max === "number" && max > 0;

  const handleSave = () => {
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return; // ปุ่ม disabled เมื่อช่องว่าง — รอบนี้กันค่าผิดซ้ำ
    saveWeightEntry(activePet.id, val, selectedDate);
    setNewWeight("");
    setEditingDate(null);
  };

  const startEdit = (entry) => {
    setEditingDate(new Date(entry.date));
    setSelectedDate(new Date(entry.date));
    setNewWeight(String(entry.value));
  };

  const cancelEdit = () => {
    setEditingDate(null);
    setNewWeight("");
  };

  const history = data.slice().reverse(); // ล่าสุดบนสุด

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title={`น้ำหนักของ ${activePet.name}`} onBack={() => go("petProfile")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
        <Reveal>
          <ShadCard>
            <CardHeader>
              <View style={styles.titleRow}>
                <CardTitle>แนวโน้มน้ำหนัก (kg)</CardTitle>
                {trend && (
                  <Badge variant={trend === "up" ? "warning" : trend === "down" ? "success" : "secondary"}>
                    {trend === "up" ? "▲ เพิ่มขึ้น" : trend === "down" ? "▼ ลดลง" : "— คงที่"}
                  </Badge>
                )}
              </View>
            </CardHeader>
            <CardContent>
              {data.length > 0 ? (
                <SimpleLineChart
                  data={data.map((e) => e.value)}
                  healthyRange={activePet.healthyRange}
                  labels={data.map((e) => formatGregorianShort(new Date(e.date)))}
                />
              ) : (
                <EmptyState category="weight" />
              )}
              {hasRange && (
                <AppText style={styles.rangeText}>
                  ช่วงสุขภาพของ {activePet.name}: {min}–{max} kg
                </AppText>
              )}
              {data.length === 0 ? (
                <AppText style={styles.noDataText}>ยังไม่มีข้อมูล — บันทึกน้ำหนักครั้งแรกด้านล่าง</AppText>
              ) : (
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <AppText style={styles.latestLabel}>ปัจจุบัน</AppText>
                    <AppText style={styles.latestValue}>{latestWeight} kg</AppText>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <AppText style={styles.latestLabel}>ก่อนหน้า</AppText>
                    <AppText style={styles.prevValue}>{prevWeight} kg</AppText>
                  </View>
                </View>
              )}
            </CardContent>
          </ShadCard>
        </Reveal>

        {/* บันทึก/แก้ไข — วันที่อยู่ในการ์ดเดียวกัน (แตะเพื่อเปิดปฏิทิน) */}
        <Reveal>
          <ShadCard style={{ marginTop: 16 }}>
            <CardHeader>
              <CardTitle>
                {editingDate
                  ? `แก้ไขน้ำหนักวันที่ ${formatGregorian(editingDate)}`
                  : "บันทึกน้ำหนัก (kg) วันที่ " + formatGregorian(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RealCalendar
                compact
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                markedDates={[new Date()]}
              />
              <View style={[sharedStyles.inputWrap, { height: 44, marginBottom: 12, marginTop: 10 }]}>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="น้ำหนัก เช่น 5.8"
                  placeholderTextColor={colors.textGray}
                  keyboardType="decimal-pad"
                  value={newWeight}
                  onChangeText={setNewWeight}
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {editingDate && (
                  <Button title="ยกเลิกแก้ไข" variant="secondary" onPress={cancelEdit} style={{ flex: 1 }} />
                )}
                <Button
                  title={editingDate ? "บันทึกการแก้ไข" : "บันทึกน้ำหนัก"}
                  onPress={handleSave}
                  disabled={!newWeight.trim()}
                  style={{ flex: 1 }}
                />
              </View>
            </CardContent>
          </ShadCard>
        </Reveal>

        {/* ประวัติทั้งหมด — ล่าสุดบนสุด แก้ไข/ลบได้ */}
        {history.length > 0 && (
          <Reveal>
            <ShadCard style={{ marginTop: 16 }}>
              <CardHeader>
                <CardTitle>ประวัติทั้งหมด ({history.length} ครั้ง)</CardTitle>
              </CardHeader>
              <CardContent style={{ paddingTop: 0 }}>
                {history.map((e, i) => {
                  const isEditing = editingDate && editingDate.toDateString() === new Date(e.date).toDateString();
                  return (
                    <View key={e.date} style={[styles.historyRow, i > 0 && styles.historyDivider]}>
                      <View style={{ flex: 1 }}>
                        <AppText style={styles.historyValue}>
                          {e.value} kg
                          {i === 0 && <AppText style={styles.historyLatest}> · ล่าสุด</AppText>}
                        </AppText>
                        <AppText style={styles.historyDate}>{formatGregorian(new Date(e.date))}</AppText>
                      </View>
                      <IconButton
                        icon="edit-2"
                        size={17}
                        color={isEditing ? colors.accentDeep : colors.brown}
                        accessibilityLabel={`แก้ไขน้ำหนักวันที่ ${formatGregorian(new Date(e.date))}`}
                        onPress={() => startEdit(e)}
                      />
                      <IconButton
                        icon="trash-2"
                        size={17}
                        color={colors.danger}
                        accessibilityLabel={`ลบน้ำหนักวันที่ ${formatGregorian(new Date(e.date))}`}
                        onPress={() =>
                          confirmDelete({
                            title: "ลบรายการน้ำหนัก",
                            message: `ลบ ${e.value} kg (${formatGregorian(new Date(e.date))}) ใช่ไหม?`,
                            onConfirm: () => removeWeightEntry(activePet.id, new Date(e.date)),
                          })
                        }
                      />
                    </View>
                  );
                })}
              </CardContent>
            </ShadCard>
          </Reveal>
        )}
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rangeText: { fontSize: 12, color: colors.textGray, textAlign: "center", marginTop: 6 },
  statsRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  statBox: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 38, backgroundColor: colors.border },
  latestLabel: { color: colors.textGray, fontSize: 13, fontWeight: "400", marginBottom: 4 },
  latestValue: { fontSize: 26, fontWeight: "700", color: colors.textDark },
  prevValue: { fontSize: 22, fontWeight: "500", color: colors.brown },
  noDataText: { fontSize: 13, fontWeight: "400", color: colors.textGray, textAlign: "center", marginTop: 14 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 10 },
  historyDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  historyValue: { fontSize: 16, fontWeight: "700", color: colors.textDark },
  historyLatest: { fontSize: 12, fontWeight: "500", color: colors.accentDeep },
  historyDate: { fontSize: 12, color: colors.textGray, marginTop: 2 },
});

export default WeightScreen;
