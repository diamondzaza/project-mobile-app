/** หน้าจอจัดการสุขภาพ */
import { useState } from "react";
import { SafeAreaView, View, Pressable, Alert, StyleSheet } from "react-native";
import { Plus, X, Check } from "lucide-react-native";

import Header from "../components/Header";
import AppText from "../components/AppText";
import Card from "../components/Card";
import Button from "../components/Button";
import Field from "../components/Field";
import AddCard from "../components/AddCard";
import EmptyState from "../components/EmptyState";
import { Card as ShadCard, CardHeader, CardTitle, CardContent, Badge, Switch } from "../components/ui";
import { colors } from "../theme";
import { sharedStyles } from "../theme/sharedStyles";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

function HealthScreen({ go, activePet, healthData, completeHealthItem, addHealthItem, remindersOn, setRemindersOn }) {
  const data = healthData[activePet.id] || { upcoming: [], completed: [] };
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const reminders = remindersOn ?? true;

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกทั้งหัวข้อและวันที่");
      return;
    }
    addHealthItem(activePet.id, { id: `h${Date.now()}`, title: newTitle.trim(), date: newDate.trim() });
    setNewTitle("");
    setNewDate("");
    setShowAdd(false);
  };

  const handleCancelAdd = () => {
    setNewTitle("");
    setNewDate("");
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header
        title={`สุขภาพของ ${activePet.name}`}
        onBack={() => go("petProfile")}
        right={
          <Button
            variant="ghost"
            size="icon"
            iconLeft={showAdd ? <X size={20} color="#A8473D" strokeWidth={2.4} /> : <Plus size={20} color="#A8473D" strokeWidth={2.4} />}
            onPress={() => setShowAdd((v) => !v)}
            style={{ backgroundColor: colors.cardTanBg }}
          />
        }
      />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
        <Reveal>
          <ShadCard style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle>การแจ้งเตือนวัคซีน</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.reminderRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.reminderTitle}>เปิดการแจ้งเตือน</AppText>
                  <AppText style={styles.reminderSub}>รับการแจ้งเตือนก่อนถึงวันนัดฉีดวัคซีน</AppText>
                </View>
                <Switch value={reminders} onValueChange={setRemindersOn} />
              </View>
            </CardContent>
          </ShadCard>
        </Reveal>

        {showAdd && (
          <Reveal>
            <AddCard title="เพิ่มรายการสุขภาพ" onSave={handleAdd} onCancel={handleCancelAdd} saveLabel="เพิ่ม">
              <Field label="หัวข้อ" value={newTitle} onChangeText={setNewTitle} placeholder="เช่น ถ่ายพยาธิ" />
              <Field label="วันที่" value={newDate} onChangeText={setNewDate} placeholder="เช่น 12 ก.ค." />
            </AddCard>
          </Reveal>
        )}

        <View style={styles.sectionHead}>
          <AppText style={styles.sectionTitle}>ที่กำลังจะมาถึง</AppText>
          <Badge variant="warning">{data.upcoming.length}</Badge>
        </View>
        {data.upcoming.length === 0 ? (
          <EmptyState category="health" message="ยังไม่มีรายการที่กำลังจะมาถึง" />
        ) : (
          data.upcoming.map((item) => (
            <Reveal key={item.id}>
              <Card style={sharedStyles.row}>
                <Pressable
                  onPress={() => completeHealthItem(activePet.id, item.id)}
                  style={styles.checkbox}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={[sharedStyles.rowTitle, { fontWeight: "500" }]}>{item.title}</AppText>
                  <AppText style={[sharedStyles.rowDate, { fontWeight: "400" }]}>{item.date}</AppText>
                </View>
              </Card>
            </Reveal>
          ))
        )}

        <View style={[styles.sectionHead, { marginTop: 24 }]}>
          <AppText style={styles.sectionTitle}>เสร็จแล้ว</AppText>
          <Badge variant="success">{data.completed.length}</Badge>
        </View>
        {data.completed.length === 0 ? (
          <EmptyState category="health" message="ยังไม่มีรายการที่เสร็จแล้ว" icon="check-circle" />
        ) : (
          data.completed.map((item) => (
            <Reveal key={item.id}>
              <Card style={sharedStyles.row}>
                <View
                  style={[
                    styles.checkbox,
                    { backgroundColor: "#A8473D", borderColor: "#A8473D" },
                  ]}
                >
                  <Check size={14} color="#fff" strokeWidth={3} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <AppText style={[sharedStyles.rowTitle, { fontWeight: "500" }]}>{item.title}</AppText>
                  <AppText style={[sharedStyles.rowDate, { fontWeight: "400" }]}>{item.date}</AppText>
                </View>
              </Card>
            </Reveal>
          ))
        )}
      </AnimatedScrollView>
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
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#A8552E",
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HealthScreen;
