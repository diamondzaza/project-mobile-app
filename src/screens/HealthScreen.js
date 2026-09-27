/** หน้าจอจัดการสุขภาพ — กรองตามหมวดหมู่ + ฟอร์มครบ (วันที่/ระยะเตือน/รายละเอียดเพิ่มเติม/แนบรูป) + Modal รายละเอียด */
import { useState } from "react";
import { SafeAreaView, View, Pressable, Alert, StyleSheet, Modal, ScrollView, Image } from "react-native";
import { X, Check, ImagePlus, ChevronDown, ChevronUp } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

import Header from "../components/Header";
import AppText from "../components/AppText";
import Card from "../components/Card";
import Button from "../components/Button";
import Field from "../components/Field";
import AddCard from "../components/AddCard";
import EmptyState from "../components/EmptyState";
import RealCalendar from "../calendar/RealCalendar";
import { Card as ShadCard, CardHeader, CardTitle, CardContent, Badge, Switch } from "../components/ui";
import { colors, radius, shadow } from "../theme";
import { formatGregorian } from "../utils/date";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

// หมวดหมู่รายการสุขภาพ — ใช้ทั้งชิปกรองและชิปเลือกในฟอร์ม
const CATEGORIES = [
  { key: "vaccine", label: "วัคซีน" },
  { key: "worming", label: "ถ่ายพยาธิ" },
  { key: "checkup", label: "ตรวจสุขภาพ" },
  { key: "neuter", label: "ทำหมัน" },
  { key: "grooming", label: "กรูมมิ่ง" },
  { key: "medication", label: "ยา" },
];

const REMIND_OPTIONS = [1, 3, 7]; // ตัวเลือกระยะแจ้งเตือนล่วงหน้า (วัน)

const categoryLabel = (key) => {
  const found = CATEGORIES.find((c) => c.key === key);
  return found ? found.label : "อื่นๆ";
};

// แปลง Date เป็นคีย์วันที่แบบ local (ไม่ผ่าน toISOString กันเพี้ยนเขตเวลา)
const pad2 = (n) => String(n).padStart(2, "0");
const toLocalKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function HealthScreen({ go, activePet, healthData, completeHealthItem, addHealthItem, remindersOn, setRemindersOn }) {
  const data = healthData[activePet.id] || { upcoming: [], completed: [] };
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  // ปฏิทินเลือกวันที่ (แทนการพิมพ์อิสระ)
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  // หมวดหมู่ — ชิปกรองรายการ + ค่าเลือกในฟอร์มเพิ่ม
  const [activeCategory, setActiveCategory] = useState("all");
  const [newCategory, setNewCategory] = useState("vaccine");
  // ระยะแจ้งเตือนล่วงหน้าของรายการใหม่ (วัน)
  const [newRemindDays, setNewRemindDays] = useState(3);
  // ส่วนรายละเอียดเพิ่มเติม (ไม่บังคับ) ในฟอร์ม
  const [showMore, setShowMore] = useState(false);
  const [newClinic, setNewClinic] = useState("");
  const [newVetName, setNewVetName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  // Modal รายละเอียด — เก็บ { section, id } แล้วค่อยหา item ตอน render
  const [selected, setSelected] = useState(null);
  const reminders = remindersOn ?? true;

  const handlePickDate = (d) => {
    setCalendarDate(d);
    setNewDate(formatGregorian(d));
    setShowCalendar(false);
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDate("");
    setNewCategory("vaccine");
    setNewRemindDays(3);
    setShowMore(false);
    setNewClinic("");
    setNewVetName("");
    setNewPrice("");
    setNewNotes("");
    setNewPhoto(null);
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกหัวข้อและเลือกวันที่");
      return;
    }
    const priceNum = Number(newPrice.trim());
    addHealthItem(activePet.id, {
      id: `h${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      dueDate: toLocalKey(calendarDate),
      date: newDate.trim(),
      remindDaysBefore: newRemindDays,
      clinic: newClinic.trim(),
      vetName: newVetName.trim(),
      price: newPrice.trim() !== "" && Number.isFinite(priceNum) ? priceNum : null,
      notes: newNotes.trim(),
      photo: newPhoto || "",
    });
    resetForm();
    setShowAdd(false);
  };

  const handleCancelAdd = () => {
    resetForm();
    setShowAdd(false);
  };

  // แนบรูปใบรับรอง/เอกสารจากคลังรูป
  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("ต้องการสิทธิ์การเข้าถึง", "กรุณาอนุญาตการเข้าถึงรูปภาพเพื่อแนบรูป");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setNewPhoto(result.assets[0].uri);
    }
  };

  // กรองตามหมวดหมู่ที่เลือก (รายการไม่ระบุหมวดแสดงเฉพาะ "ทั้งหมด")
  const matchCategory = (item) => activeCategory === "all" || item.category === activeCategory;
  const upcoming = data.upcoming.filter(matchCategory);
  const completed = data.completed.filter(matchCategory);

  // หา item ที่เปิดใน Modal รายละเอียด
  const selectedItem = selected
    ? (selected.section === "upcoming" ? data.upcoming : data.completed).find((i) => i.id === selected.id)
    : null;

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header title={`สุขภาพของ ${activePet.name}`} onBack={() => go("petProfile")} />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
        <Reveal>
          <ShadCard style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle>การแจ้งเตือน</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.reminderRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.reminderTitle}>เปิดการแจ้งเตือน</AppText>
                  <AppText style={styles.reminderSub}>แจ้งล่วงหน้าตามที่ตั้งในแต่ละรายการ (1 / 3 / 7 วัน)</AppText>
                </View>
                <Switch value={reminders} onValueChange={setRemindersOn} />
              </View>
            </CardContent>
          </ShadCard>
        </Reveal>

        {/* ชิปกรองหมวดหมู่ */}
        <View style={styles.chipRow}>
          {[{ key: "all", label: "ทั้งหมด" }, ...CATEGORIES].map((c) => {
            const active = activeCategory === c.key;
            return (
              <Pressable
                key={c.key}
                onPress={() => setActiveCategory(c.key)}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                accessibilityRole="button"
                accessibilityLabel={`กรองหมวดหมู่${c.label}`}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [
                  styles.chip,
                  active && styles.chipActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <AppText style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</AppText>
              </Pressable>
            );
          })}
        </View>

        {showAdd && (
          <Reveal>
            <AddCard title="เพิ่มรายการสุขภาพ" onSave={handleAdd} onCancel={handleCancelAdd} saveLabel="เพิ่ม">
              <Field label="หัวข้อ" value={newTitle} onChangeText={setNewTitle} placeholder="เช่น ถ่ายพยาธิ" />

              {/* ชิปเลือกหมวดหมู่ของรายการใหม่ */}
              <AppText style={sharedStyles.label}>หมวดหมู่</AppText>
              <View style={styles.chipRow}>
                {CATEGORIES.map((c) => {
                  const active = newCategory === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => setNewCategory(c.key)}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={`เลือกหมวดหมู่${c.label}`}
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.chip,
                        active && styles.chipActive,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <AppText style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</AppText>
                    </Pressable>
                  );
                })}
              </View>

              {/* ช่องวันที่ — แตะเพื่อเปิดปฏิทิน แทนการพิมพ์อิสระ */}
              <Pressable
                onPress={() => setShowCalendar(true)}
                accessibilityRole="button"
                accessibilityLabel="เลือกวันที่"
                style={({ pressed }) => [
                  sharedStyles.inputWrap,
                  { height: 44, marginBottom: 12, marginTop: 12 },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <AppText style={[sharedStyles.input, !newDate && { color: colors.textGray }]}>
                  {newDate || "เลือกวันที่"}
                </AppText>
              </Pressable>

              {/* ชิปเลือกระยะแจ้งเตือนล่วงหน้า */}
              <AppText style={sharedStyles.label}>แจ้งเตือนล่วงหน้า</AppText>
              <View style={styles.chipRow}>
                {REMIND_OPTIONS.map((d) => {
                  const active = newRemindDays === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setNewRemindDays(d)}
                      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={`แจ้งเตือนล่วงหน้า ${d} วัน`}
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.chip,
                        active && styles.chipActive,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <AppText style={[styles.chipText, active && styles.chipTextActive]}>{d} วัน</AppText>
                    </Pressable>
                  );
                })}
              </View>

              {/* ปุ่มกางรายละเอียดเพิ่มเติม */}
              <Pressable
                onPress={() => setShowMore((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showMore ? "ซ่อนรายละเอียดเพิ่มเติม" : "แสดงรายละเอียดเพิ่มเติม"}
                hitSlop={{ top: 8, bottom: 8 }}
                style={({ pressed }) => [styles.moreToggle, pressed && { opacity: 0.85 }]}
              >
                <AppText style={styles.moreToggleText}>รายละเอียดเพิ่มเติม (ไม่บังคับ)</AppText>
                {showMore ? (
                  <ChevronUp size={18} color={colors.textBody} strokeWidth={2.2} />
                ) : (
                  <ChevronDown size={18} color={colors.textBody} strokeWidth={2.2} />
                )}
              </Pressable>

              {showMore && (
                <View>
                  <Field label="คลินิก / สถานที่" value={newClinic} onChangeText={setNewClinic} placeholder="เช่น คลินิกตัวอย่าง" />
                  <Field label="ชื่อสัตวแพทย์" value={newVetName} onChangeText={setNewVetName} placeholder="เช่น หมอเอ" />
                  <Field
                    label="ราคา (บาท)"
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="เช่น 350"
                    keyboardType="decimal-pad"
                  />
                  <Field
                    label="บันทึกเพิ่มเติม"
                    value={newNotes}
                    onChangeText={setNewNotes}
                    placeholder="เช่น ยาที่ได้รับ, อาการหลังทำ"
                    multiline
                    style={styles.notesInput}
                  />

                  {/* แนบรูป/ไฟล์ใบรับรอง */}
                  {newPhoto ? (
                    <View style={styles.photoPreviewWrap}>
                      <Image source={{ uri: newPhoto }} style={styles.photoPreview} resizeMode="cover" />
                      <Pressable
                        onPress={() => setNewPhoto(null)}
                        accessibilityRole="button"
                        accessibilityLabel="เอารูปที่แนบออก"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={({ pressed }) => [styles.photoRemove, pressed && { opacity: 0.85 }]}
                      >
                        <X size={14} color={colors.white} strokeWidth={2.6} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={pickPhoto}
                      accessibilityRole="button"
                      accessibilityLabel="แนบรูปใบรับรอง"
                      style={({ pressed }) => [styles.attachBtn, pressed && { opacity: 0.85 }]}
                    >
                      <ImagePlus size={18} color={colors.textBody} strokeWidth={2} />
                      <AppText style={styles.attachText}>แนบรูป / ใบรับรองวัคซีน</AppText>
                    </Pressable>
                  )}
                </View>
              )}
            </AddCard>
          </Reveal>
        )}

        <View style={styles.sectionHead}>
          <AppText style={styles.sectionTitle}>ที่กำลังจะมาถึง</AppText>
          <Badge variant="warning">{upcoming.length}</Badge>
        </View>
        {upcoming.length === 0 ? (
          <EmptyState category="health" message="ยังไม่มีรายการที่กำลังจะมาถึง" />
        ) : (
          upcoming.map((item) => (
            <Reveal key={item.id}>
              <Card style={sharedStyles.row}>
                <Pressable
                  onPress={() => setSelected({ section: "upcoming", id: item.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`ดูรายละเอียด${item.title}`}
                  style={({ pressed }) => [
                    { flex: 1, flexDirection: "row", alignItems: "center" },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {/* ช่องติ๊กเสร็จ — กดตรงนี้เพื่อทำเครื่องหมายเสร็จโดยไม่ต้องเปิดรายละเอียด */}
                  <Pressable
                    onPress={() => completeHealthItem(activePet.id, item.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`ทำเครื่องหมายว่า${item.title}เสร็จแล้ว`}
                    accessibilityState={{ checked: false }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 4 }}
                    style={({ pressed }) => [pressed && { opacity: 0.6 }]}
                  >
                    <View style={styles.checkbox} />
                  </Pressable>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.rowTitleRow}>
                      <AppText style={[sharedStyles.rowTitle, { fontWeight: "500" }]}>{item.title}</AppText>
                      <Badge variant="secondary">{categoryLabel(item.category)}</Badge>
                    </View>
                    <AppText style={[sharedStyles.rowDate, { fontWeight: "400" }]}>{item.date}</AppText>
                  </View>
                </Pressable>
              </Card>
            </Reveal>
          ))
        )}

        <View style={[styles.sectionHead, { marginTop: 24 }]}>
          <AppText style={styles.sectionTitle}>เสร็จแล้ว</AppText>
          <Badge variant="success">{completed.length}</Badge>
        </View>
        {completed.length === 0 ? (
          <EmptyState category="health" message="ยังไม่มีรายการที่เสร็จแล้ว" icon="check-circle" />
        ) : (
          completed.map((item) => (
            <Reveal key={item.id}>
              <Card style={sharedStyles.row}>
                <Pressable
                  onPress={() => setSelected({ section: "completed", id: item.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`ดูรายละเอียด${item.title}`}
                  style={({ pressed }) => [
                    { flex: 1, flexDirection: "row", alignItems: "center" },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { backgroundColor: colors.danger, borderColor: colors.danger },
                    ]}
                  >
                    <Check size={14} color={colors.white} strokeWidth={3} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.rowTitleRow}>
                      <AppText style={[sharedStyles.rowTitle, { fontWeight: "500" }]}>{item.title}</AppText>
                      <Badge variant="secondary">{categoryLabel(item.category)}</Badge>
                    </View>
                    <AppText style={[sharedStyles.rowDate, { fontWeight: "400" }]}>{item.date}</AppText>
                  </View>
                </Pressable>
              </Card>
            </Reveal>
          ))
        )}
      </AnimatedScrollView>

      {/* ปฏิทินเลือกวันที่ของรายการสุขภาพ */}
      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalWrap}>
          <Pressable style={[StyleSheet.absoluteFill, styles.modalBackdrop]} onPress={() => setShowCalendar(false)} />
          <View style={styles.modalCard}>
            <RealCalendar
              compact
              selectedDate={calendarDate}
              onSelectDate={handlePickDate}
              markedDates={[new Date()]}
            />
          </View>
        </View>
      </Modal>

      {/* Modal รายละเอียดรายการสุขภาพ */}
      <Modal visible={Boolean(selectedItem)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalWrap}>
          <Pressable style={[StyleSheet.absoluteFill, styles.modalBackdrop]} onPress={() => setSelected(null)} />
          {selectedItem && (
            <View style={[styles.modalCard, styles.detailCard]}>
              <View style={styles.detailHead}>
                <AppText style={styles.detailTitle}>{selectedItem.title}</AppText>
                <Pressable
                  onPress={() => setSelected(null)}
                  accessibilityRole="button"
                  accessibilityLabel="ปิดหน้าต่างรายละเอียด"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={({ pressed }) => [styles.detailClose, pressed && { opacity: 0.85 }]}
                >
                  <X size={20} color={colors.textBody} strokeWidth={2.4} />
                </Pressable>
              </View>
              <Badge variant="secondary">{categoryLabel(selectedItem.category)}</Badge>
              <ScrollView style={styles.detailScroll} contentContainerStyle={{ paddingBottom: 8 }}>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>วันที่</AppText>
                  <AppText style={styles.detailValue}>{selectedItem.date}</AppText>
                </View>
                {selectedItem.clinic ? (
                  <View style={styles.detailRow}>
                    <AppText style={styles.detailLabel}>คลินิก / สถานที่</AppText>
                    <AppText style={styles.detailValue}>{selectedItem.clinic}</AppText>
                  </View>
                ) : null}
                {selectedItem.vetName ? (
                  <View style={styles.detailRow}>
                    <AppText style={styles.detailLabel}>สัตวแพทย์</AppText>
                    <AppText style={styles.detailValue}>{selectedItem.vetName}</AppText>
                  </View>
                ) : null}
                {selectedItem.price != null ? (
                  <View style={styles.detailRow}>
                    <AppText style={styles.detailLabel}>ราคา</AppText>
                    <AppText style={styles.detailValue}>{selectedItem.price} บาท</AppText>
                  </View>
                ) : null}
                {selectedItem.remindDaysBefore != null ? (
                  <View style={styles.detailRow}>
                    <AppText style={styles.detailLabel}>การแจ้งเตือน</AppText>
                    <AppText style={styles.detailValue}>แจ้งล่วงหน้า {selectedItem.remindDaysBefore} วัน</AppText>
                  </View>
                ) : null}
                {selectedItem.notes ? (
                  <View style={styles.detailRow}>
                    <AppText style={styles.detailLabel}>บันทึกเพิ่มเติม</AppText>
                    <AppText style={styles.detailValue}>{selectedItem.notes}</AppText>
                  </View>
                ) : null}
                {selectedItem.photo ? (
                  <View style={{ marginTop: 4 }}>
                    <AppText style={styles.detailLabel}>รูปที่แนบ</AppText>
                    <Image
                      source={{ uri: selectedItem.photo }}
                      style={styles.detailPhoto}
                      resizeMode="contain"
                    />
                  </View>
                ) : null}
              </ScrollView>
              {selected.section === "upcoming" && (
                <Button
                  title="ทำแล้ว"
                  onPress={() => {
                    completeHealthItem(activePet.id, selectedItem.id);
                    setSelected(null);
                  }}
                  style={{ marginTop: 12 }}
                />
              )}
            </View>
          )}
        </View>
      </Modal>

      {!showAdd && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Button title="เพิ่มรายการสุขภาพ" onPress={() => setShowAdd(true)} style={{ width: "100%" }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.textBody },
  reminderRow: { flexDirection: "row", alignItems: "center" },
  reminderTitle: { fontSize: 15, fontWeight: "700", color: colors.textDark },
  reminderSub: { fontSize: 13, fontWeight: "400", color: colors.textGray, marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardTanBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { backgroundColor: colors.accentDeep, borderColor: colors.accentDeep },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textBody },
  chipTextActive: { color: colors.white },
  moreToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    marginTop: 4,
    marginBottom: 8,
  },
  moreToggleText: { fontSize: 14, fontWeight: "600", color: colors.textBody },
  notesInput: { height: 80, textAlignVertical: "top" },
  attachBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardTanBg,
    paddingVertical: 10,
  },
  attachText: { fontSize: 14, fontWeight: "600", color: colors.textBody },
  photoPreviewWrap: { alignSelf: "flex-start", marginVertical: 6 },
  photoPreview: { width: 96, height: 72, borderRadius: radius.sm },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.accentDeep,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalBackdrop: { backgroundColor: colors.textDark, opacity: 0.5 },
  modalCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 8,
    ...shadow,
  },
  detailCard: { padding: 16 },
  detailHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  detailTitle: { fontSize: 17, fontWeight: "700", color: colors.textDark, flex: 1, marginRight: 8 },
  detailClose: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  detailScroll: { marginTop: 12, maxHeight: 380 },
  detailRow: { marginBottom: 10 },
  detailLabel: { fontSize: 12, fontWeight: "600", color: colors.textGray, marginBottom: 2 },
  detailValue: { fontSize: 15, color: colors.textBody },
  detailPhoto: { width: "100%", height: 240, borderRadius: radius.md, marginTop: 6, backgroundColor: colors.cardTanBg },
});

export default HealthScreen;
