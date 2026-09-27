/** หน้าจอนัดหมายของสัตว์เลี้ยงตัวปัจจุบัน */
import { useState, useRef } from "react";
import { SafeAreaView, View, Pressable, StyleSheet } from "react-native";
import { Plus, X } from "lucide-react-native";

import AppText from "../components/AppText";

import Card from "../components/Card";
import Header from "../components/Header";
import Button from "../components/Button";
import AppointmentCard from "../components/AppointmentCard";
import EmptyState from "../components/EmptyState";
import RealCalendar from "../calendar/RealCalendar";
import AppointmentForm from "./AppointmentForm";
import { Card as ShadCard, CardHeader, CardTitle, CardContent, Badge } from "../components/ui";
import { sharedStyles } from "../theme/sharedStyles";
import { colors } from "../theme";
import { confirmDelete } from "../utils/confirm";
import { formatGregorian } from "../utils/date";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function PetAppointmentsScreen({ go, activePet, appointments, addAppointment, editAppointment, removeAppointment, markAppointmentDone }) {
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null); // นัดที่กำลังแก้ไข (null = โหมดสร้างใหม่)
  const scrollViewRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null); // null = แสดงทั้งหมด
  const myAppts = appointments.filter((a) => a.petId === activePet.id);
  const markedDates = myAppts.map((a) => a.dateObj);
  const today = startOfDay(new Date());
  const upcoming = myAppts.filter((a) => startOfDay(a.dateObj) >= today).sort((a, b) => a.dateObj - b.dateObj);
  const past = myAppts.filter((a) => startOfDay(a.dateObj) < today).sort((a, b) => b.dateObj - a.dateObj);
  // ถ้าเลือกวันในปฏิทินไว้ กรอง upcoming เหลือเฉพาะวันนั้น
  const upcomingShown = selectedDate
    ? upcoming.filter((a) => startOfDay(a.dateObj).getTime() === startOfDay(selectedDate).getTime())
    : upcoming;

  // กดดินสอบนการ์ด: เปิดฟอร์มโหมดแก้ไข แล้วเลื่อนขึ้นบนให้เห็นฟอร์ม
  const handleEdit = (a) => {
    setEditingAppt(a);
    setShowForm(true);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header
        title={`นัดหมายของ ${activePet.name}`}
        onBack={() => go("petProfile")}
        right={
          <Button
            variant="ghost"
            size="icon"
            iconLeft={showForm ? <X size={20} color={colors.accentDeep} strokeWidth={2.4} /> : <Plus size={20} color={colors.accentDeep} strokeWidth={2.4} />}
            onPress={() => {
              // กด + ปกติ = สร้างใหม่ เคลียร์โหมดแก้ไขทิ้งก่อน
              if (!showForm) setEditingAppt(null);
              setShowForm(!showForm);
            }}
            style={{ backgroundColor: colors.cardTanBg }}
          />
        }
      />
      <AnimatedScrollView ref={scrollViewRef} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
        <Reveal>
          <ShadCard style={{ marginBottom: 10 }}>
            <CardHeader>
              <CardTitle>ปฏิทิน</CardTitle>
            </CardHeader>
            <CardContent>
              <RealCalendar
                markedDates={markedDates}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
              />
            </CardContent>
          </ShadCard>
        </Reveal>

        {showForm && (
          <Reveal>
            <AppointmentForm
              pets={[activePet]}
              defaultPetId={activePet.id}
              initial={editingAppt}
              submitLabel={editingAppt ? "บันทึกการเปลี่ยนแปลง" : null}
              onSubmit={(appt) => {
                // มี editingAppt = แก้ไข (ส่งเฉพาะฟิลด์ที่แก้ได้) ไม่งั้นสร้างใหม่
                if (editingAppt) {
                  editAppointment(editingAppt.id, { title: appt.title, dateObj: appt.dateObj, time: appt.time, location: appt.location });
                } else {
                  addAppointment(appt);
                }
                setEditingAppt(null);
                setShowForm(false);
              }}
              onCancel={() => {
                setEditingAppt(null);
                setShowForm(false);
              }}
            />
          </Reveal>
        )}

        <View style={styles.sectionHead}>
          <AppText style={styles.sectionTitle}>ที่กำลังจะมาถึง</AppText>
          <Badge variant="default">{upcomingShown.length}</Badge>
          {selectedDate && (
            <Pressable
              onPress={() => setSelectedDate(null)}
              accessibilityRole="button"
              accessibilityLabel="แสดงนัดหมายทั้งหมด"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={({ pressed }) => [styles.showAllBtn, pressed && { opacity: 0.85 }]}
            >
              <AppText style={styles.showAllText}>แสดงทั้งหมด ({formatGregorian(selectedDate)})</AppText>
            </Pressable>
          )}
        </View>
        {upcomingShown.length === 0 && !showForm && (
          <EmptyState
            category="appointments"
            message={selectedDate ? "ไม่มีนัดหมายในวันที่เลือก" : "ยังไม่มีนัดหมายที่กำลังจะมาถึง"}
            action={{ label: "เพิ่มนัดหมาย", onPress: () => { setEditingAppt(null); setShowForm(true); } }}
          />
        )}
        {upcomingShown.map((a) => (
          <Reveal key={a.id}>
            <AppointmentCard
              data={a}
              onMarkDone={markAppointmentDone ? () => markAppointmentDone(a.id) : undefined}
              onEdit={() => handleEdit(a)}
              onDelete={() =>
                confirmDelete({
                  title: "ลบนัดหมาย",
                  message: `ลบ ${a.title} ใช่ไหม?`,
                  onConfirm: () => removeAppointment(a.id),
                })
              }
            />
          </Reveal>
        ))}

        {past.length > 0 && (
          <View style={[styles.sectionHead, { marginTop: 24 }]}>
            <AppText style={styles.sectionTitle}>ที่ผ่านมา</AppText>
            <Badge variant="secondary">{past.length}</Badge>
          </View>
        )}
        {past.map((a) => (
          <Reveal key={a.id}>
            <AppointmentCard
              data={a}
              onMarkDone={markAppointmentDone ? () => markAppointmentDone(a.id) : undefined}
              onEdit={() => handleEdit(a)}
              onDelete={() =>
                confirmDelete({ title: "ลบนัดหมาย", message: `ลบ ${a.title} ใช่ไหม?`, onConfirm: () => removeAppointment(a.id) })
              }
            />
          </Reveal>
        ))}
      </AnimatedScrollView>
      {!showForm && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Button title="เพิ่มนัดหมายใหม่" onPress={() => { setEditingAppt(null); setShowForm(true); }} style={{ width: "100%" }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.textBody },
  showAllBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  showAllText: { fontSize: 13, fontWeight: "600", color: colors.accentDeep },
});

export default PetAppointmentsScreen;
