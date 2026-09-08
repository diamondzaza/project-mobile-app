/** หน้าจอนัดหมายของสัตว์เลี้ยงตัวปัจจุบัน */
import { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
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
import AnimatedScrollView from "../components/AnimatedScrollView";
import Reveal from "../components/Reveal";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function PetAppointmentsScreen({ go, activePet, appointments, addAppointment, removeAppointment }) {
  const [showForm, setShowForm] = useState(false);
  const myAppts = appointments.filter((a) => a.petId === activePet.id);
  const markedDates = myAppts.map((a) => a.dateObj);
  const today = startOfDay(new Date());
  const upcoming = myAppts.filter((a) => startOfDay(a.dateObj) >= today).sort((a, b) => a.dateObj - b.dateObj);
  const past = myAppts.filter((a) => startOfDay(a.dateObj) < today).sort((a, b) => b.dateObj - a.dateObj);

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header
        title={`นัดหมายของ ${activePet.name}`}
        onBack={() => go("petProfile")}
        right={
          <Button
            variant="ghost"
            size="icon"
            iconLeft={showForm ? <X size={20} color="#A8552E" strokeWidth={2.4} /> : <Plus size={20} color="#A8552E" strokeWidth={2.4} />}
            onPress={() => setShowForm(!showForm)}
            style={{ backgroundColor: colors.cardTanBg }}
          />
        }
      />
      <AnimatedScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 }}>
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
              pets={[activePet]}
              defaultPetId={activePet.id}
              onSubmit={(appt) => {
                addAppointment(appt);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </Reveal>
        )}

        <View style={styles.sectionHead}>
          <AppText style={styles.sectionTitle}>ที่กำลังจะมาถึง</AppText>
          <Badge variant="default">{upcoming.length}</Badge>
        </View>
        {upcoming.length === 0 && !showForm && <EmptyState category="appointments" message="ยังไม่มีนัดหมายที่กำลังจะมาถึง" />}
        {upcoming.map((a) => (
          <Reveal key={a.id}>
            <AppointmentCard
              data={a}
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
            <AppointmentCard data={a} onDelete={() =>
              confirmDelete({ title: "ลบนัดหมาย", message: `ลบ ${a.title} ใช่ไหม?`, onConfirm: () => removeAppointment(a.id) })} />
          </Reveal>
        ))}
      </AnimatedScrollView>
      {!showForm && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Button title="เพิ่มนัดหมายใหม่" onPress={() => setShowForm(true)} style={{ width: "100%" }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.textBody },
});

export default PetAppointmentsScreen;
