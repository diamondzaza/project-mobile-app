/** หน้าจอนัดหมายทั้งหมดของสัตว์เลี้ยงทุกตัว แสดงปฏิทินรวมและรายการนัดเรียงตามวันที่ */
import { useState, useMemo, useRef } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";

import AppText from "../components/AppText";

import Header from "../components/Header";
import IconButton from "../components/IconButton";
import BottomTabBar, { TAB_BAR_CLEARANCE } from "../components/BottomTabBar";
import AppointmentCard from "../components/AppointmentCard";
import EmptyState from "../components/EmptyState";
import RealCalendar from "../calendar/RealCalendar";
import AppointmentForm from "./AppointmentForm";
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";
import useHideOnScrollBar from "../components/useHideOnScrollBar";
import { Card as ShadCard, CardHeader, CardTitle, CardContent, Badge } from "../components/ui";
import { sharedStyles } from "../theme/sharedStyles";
import { colors } from "../theme";
import { confirmDelete } from "../utils/confirm";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function OverallAppointmentsScreen({ go, appointments, pets, unreadCount = 0, addAppointment, editAppointment, removeAppointment, markAppointmentDone }) {
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null); // นัดที่กำลังแก้ไข (null = โหมดสร้างใหม่)
  const scrollViewRef = useRef(null);
  const tabBar = useHideOnScrollBar();
  const markedDates = appointments.map((a) => a.dateObj);
  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.dateObj - b.dateObj),
    [appointments]
  );
  const today = startOfDay(new Date());
  const upcoming = sortedAppointments.filter((a) => startOfDay(a.dateObj) >= today);
  const past = sortedAppointments.filter((a) => startOfDay(a.dateObj) < today);

  // เปิดฟอร์มแล้วเลื่อนขึ้นบนสุดให้เห็นฟอร์มก่อนรายการ
  const handleToggleForm = () => {
    // เปิดฟอร์มปกติ = สร้างใหม่ เคลียร์โหมดแก้ไขทิ้งก่อน
    if (!showForm) setEditingAppt(null);
    setShowForm(!showForm);
    if (!showForm) scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // กดดินสอบนการ์ด: เปิดฟอร์มโหมดแก้ไข แล้วเลื่อนขึ้นบนให้เห็นฟอร์ม
  const handleEdit = (a) => {
    setEditingAppt(a);
    setShowForm(true);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderCard = (a, isPast) => (
    <Reveal key={a.id}>
      <View style={isPast ? styles.pastCard : null}>
        <AppointmentCard
          data={a}
          petName={pets.find((p) => p.id === a.petId)?.name}
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
      </View>
    </Reveal>
  );

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header
        title="นัดหมายทั้งหมด"
        right={<IconButton icon={showForm ? "x" : "plus"} onPress={handleToggleForm} accessibilityLabel={showForm ? "ปิดฟอร์มนัดหมาย" : "เพิ่มนัดหมาย"} />}
      />
      <AnimatedScrollView ref={scrollViewRef} onScroll={tabBar.onScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: TAB_BAR_CLEARANCE }}>
        <Reveal>
          <ShadCard style={{ marginBottom: 10 }}>
            <CardHeader>
              <CardTitle>ปฏิทิน</CardTitle>
            </CardHeader>
            <CardContent>
              <RealCalendar markedDates={markedDates} />
            </CardContent>
          </ShadCard>
        </Reveal>

        {showForm && (
          <Reveal>
            <AppointmentForm
              pets={pets}
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
          <Badge variant="default">{upcoming.length}</Badge>
        </View>
        {upcoming.length === 0 && !showForm && (
          <EmptyState category="appointments" message="ยังไม่มีนัดหมายที่กำลังจะมาถึง" action={{ label: "เพิ่มนัดหมาย", onPress: handleToggleForm }} />
        )}
        {upcoming.map((a) => renderCard(a, false))}

        {past.length > 0 && (
          <View style={[styles.sectionHead, { marginTop: 24 }]}>
            <AppText style={styles.sectionTitle}>ที่ผ่านมา</AppText>
            <Badge variant="secondary">{past.length}</Badge>
          </View>
        )}
        {past.map((a) => renderCard(a, true))}
      </AnimatedScrollView>
      <BottomTabBar active="overallAppointments" go={go} anim={tabBar.anim} unreadCount={unreadCount} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.textBody },
  pastCard: { opacity: 0.55 },
});

export default OverallAppointmentsScreen;
