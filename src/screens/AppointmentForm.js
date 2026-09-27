/** แบบฟอร์มนัดหมาย — ใช้สร้างใหม่หรือแก้ไขก็ได้ (ส่ง initial = นัดที่ต้องการแก้) */
import { useState } from "react";
import { View, Pressable, Alert, StyleSheet } from "react-native";

import AppText from "../components/AppText";

import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from "../components/ui";
import Field from "../components/Field";
import PetIcon from "../components/PetIcon";
import RealCalendar from "../calendar/RealCalendar";
import { colors, glass } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { formatGregorian } from "../utils/date";
import { parseTimeText } from "../lib/db";

function AppointmentForm({ pets, onSubmit, onCancel, defaultPetId, initialDate, initial, submitLabel }) {
  // โหมดแก้ไข: ถ้ามี initial ให้ prefill ค่าเดิมทั้งหมด (useState initializer รันครั้งเดียวตอน mount)
  const [petId, setPetId] = useState(initial ? initial.petId : defaultPetId || (pets[0] && pets[0].id));
  const [title, setTitle] = useState(initial ? initial.title || "" : "");
  const [dateObj, setDateObj] = useState(initial ? initial.dateObj : initialDate || new Date());
  const [time, setTime] = useState(initial ? initial.time || "" : "");
  const [location, setLocation] = useState(initial ? initial.location || "" : "");
  const [showPicker, setShowPicker] = useState(false);

  const submit = () => {
    if (!petId) {
      Alert.alert("ยังไม่ได้เลือกสัตว์เลี้ยง", "กรุณาเลือกสัตว์เลี้ยงสำหรับนัดหมายนี้");
      return;
    }
    if (!title.trim() || !time.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกหัวข้อและเวลา");
      return;
    }
    // normalize เวลาเป็น HH:mm ก่อนบันทึก (parse ไม่ได้จะได้ 9:00 จาก parseTimeText)
    const { hour, minute } = parseTimeText(time);
    const timeText = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onSubmit({
      id: `a${Date.now()}`,
      petId,
      title: title.trim(),
      dateObj,
      time: timeText,
      location: location.trim() || "ยังไม่ระบุ",
      icon: "calendar",
    });
  };

  // ปุ่มยกเลิก — ถ้ากรอกอะไรไว้แล้ว ถามก่อนว่าจะทิ้งการเปลี่ยนแปลงไหม
  // (โหมดแก้ไข: ถ้าค่าเหมือนเดิมทุกอย่าง ปิดได้เลยโดยไม่ต้องถาม)
  const handleCancel = () => {
    const isUnchanged =
      initial &&
      title.trim() === initial.title &&
      time.trim() === initial.time &&
      location.trim() === (initial.location || "") &&
      dateObj.getTime() === new Date(initial.dateObj).getTime();
    if (!isUnchanged && (title.trim() || time.trim() || location.trim())) {
      Alert.alert("ทิ้งการเปลี่ยนแปลง?", "ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก", [
        { text: "แก้ไขต่อ", style: "cancel" },
        { text: "ทิ้งการเปลี่ยนแปลง", style: "destructive", onPress: onCancel },
      ]);
      return;
    }
    onCancel();
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>
        <CardTitle>{initial ? "แก้ไขนัดหมาย" : "นัดหมายใหม่"}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* โหมดแก้ไขล็อกสัตว์เลี้ยงไว้ที่ตัวเดิม — db.updateAppointment ไม่รองรับย้าย pet_id */}
        {pets.length > 1 && !initial && (
          <View style={{ marginBottom: 14 }}>
            <AppText style={sharedStyles.label}>สัตว์เลี้ยง</AppText>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {pets.map((p) => (
                <Pressable key={p.id} onPress={() => setPetId(p.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Badge
                    variant={petId === p.id ? "default" : "outline"}
                    icon={<PetIcon name={p.icon} size={12} color={petId === p.id ? colors.white : colors.textBody} />}
                  >
                    {p.name}
                  </Badge>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <Field label="หัวข้อ *" value={title} onChangeText={setTitle} placeholder="เช่น พาไปพบสัตวแพทย์" />

        <AppText style={sharedStyles.label}>วันที่</AppText>
        <Pressable
          onPress={() => setShowPicker(!showPicker)}
          accessibilityRole="button"
          accessibilityLabel="เลือกวันที่นัดหมาย"
          style={({ pressed }) => [styles.dateWrap, { marginBottom: showPicker ? 8 : 18 }, pressed && { opacity: 0.85 }]}
        >
          <AppText style={{ color: colors.textDark, fontWeight: "500" }}>{formatGregorian(dateObj)}</AppText>
        </Pressable>
        {showPicker && (
          <View style={{ marginBottom: 18 }}>
            <RealCalendar
              selectedDate={dateObj}
              onSelectDate={(d) => {
                setDateObj(d);
                setShowPicker(false);
              }}
              markedDates={[]}
            />
          </View>
        )}

        <Field
          label="เวลา *"
          value={time}
          onChangeText={setTime}
          placeholder="เช่น 10:00"
          keyboardType="numbers-and-punctuation"
        />
        <Field label="สถานที่ (ไม่บังคับ)" value={location} onChangeText={setLocation} placeholder="เช่น คลินิกดอนดอน" />
      </CardContent>
      <CardFooter>
        <Button title="ยกเลิก" variant="outline" onPress={handleCancel} style={{ flex: 1 }} />
        <Button title={submitLabel || "บันทึก"} onPress={submit} style={{ flex: 1 }} />
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  dateWrap: {
    width: "100%",
    height: 44,
    borderRadius: sharedStyles.inputWrap.borderRadius,
    paddingHorizontal: 14,
    justifyContent: "center",
    ...glass.surface,
  },
});

export default AppointmentForm;
