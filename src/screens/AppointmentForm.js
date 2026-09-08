/** แบบฟอร์มสร้างนัดหมายใหม่ */
import { useState } from "react";
import { View, Pressable, Alert, StyleSheet } from "react-native";

import AppText from "../components/AppText";

import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from "../components/ui";
import Field from "../components/Field";
import PetIcon from "../components/PetIcon";
import RealCalendar from "../calendar/RealCalendar";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import { formatGregorian } from "../utils/date";

function AppointmentForm({ pets, onSubmit, onCancel, defaultPetId, initialDate }) {
  const [petId, setPetId] = useState(defaultPetId || (pets[0] && pets[0].id));
  const [title, setTitle] = useState("");
  const [dateObj, setDateObj] = useState(initialDate || new Date());
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
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
    onSubmit({
      id: `a${Date.now()}`,
      petId,
      title: title.trim(),
      dateObj,
      time: time.trim(),
      location: location.trim() || "ยังไม่ระบุ",
      icon: "calendar",
    });
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>
        <CardTitle>นัดหมายใหม่</CardTitle>
      </CardHeader>
      <CardContent>
        {pets.length > 1 && (
          <View style={{ marginBottom: 14 }}>
            <AppText style={sharedStyles.label}>สัตว์เลี้ยง</AppText>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {pets.map((p) => (
                <Pressable key={p.id} onPress={() => setPetId(p.id)}>
                  <Badge
                    variant={petId === p.id ? "default" : "outline"}
                    icon={<PetIcon name={p.icon} size={12} color={petId === p.id ? "#FFFFFF" : colors.textBody} />}
                  >
                    {p.name}
                  </Badge>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <Field label="หัวข้อ" value={title} onChangeText={setTitle} placeholder="เช่น พาไปพบสัตวแพทย์" />

        <AppText style={sharedStyles.label}>วันที่</AppText>
        <Pressable
          onPress={() => setShowPicker(!showPicker)}
          style={[styles.dateWrap, { marginBottom: showPicker ? 8 : 18 }]}
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

        <Field label="เวลา" value={time} onChangeText={setTime} placeholder="เช่น 10:00 AM" />
        <Field label="สถานที่" value={location} onChangeText={setLocation} placeholder="เช่น คลินิกดอนดอน" />
      </CardContent>
      <CardFooter>
        <Button title="ยกเลิก" variant="outline" onPress={onCancel} style={{ flex: 1 }} />
        <Button title="บันทึก" onPress={submit} style={{ flex: 1 }} />
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  dateWrap: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: sharedStyles.inputWrap.borderRadius,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
});

export default AppointmentForm;
