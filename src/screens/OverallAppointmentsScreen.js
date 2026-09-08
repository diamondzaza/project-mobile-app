/** หน้าจอนัดหมายทั้งหมดของสัตว์เลี้ยงทุกตัว แสดงปฏิทินรวมและรายการนัดเรียงตามวันที่ */
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native";

import Card from "../components/Card";
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
import { sharedStyles } from "../theme/sharedStyles";
import { confirmDelete } from "../utils/confirm";

function OverallAppointmentsScreen({ go, appointments, pets, addAppointment, removeAppointment }) {
  const [showForm, setShowForm] = useState(false);
  const tabBar = useHideOnScrollBar();
  const markedDates = appointments.map((a) => a.dateObj);
  const sortedAppointments = useMemo(
    () => [...appointments].sort((a, b) => a.dateObj - b.dateObj),
    [appointments]
  );

  return (
    <SafeAreaView style={sharedStyles.container}>
      <Header
        title="นัดหมายทั้งหมด"
        right={<IconButton icon={showForm ? "x" : "plus"} onPress={() => setShowForm(!showForm)} />}
      />
      <AnimatedScrollView onScroll={tabBar.onScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: TAB_BAR_CLEARANCE }}>
        <Reveal>
          <Card style={{ marginBottom: 10 }}>
            <RealCalendar markedDates={markedDates} />
          </Card>
        </Reveal>

        {showForm && (
          <Reveal>
            <AppointmentForm
              pets={pets}
              onSubmit={(appt) => {
                addAppointment(appt);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </Reveal>
        )}

        {appointments.length === 0 && !showForm && <EmptyState category="appointments" />}
        {sortedAppointments.map((a) => (
          <Reveal key={a.id}>
            <AppointmentCard
              data={a}
              petName={pets.find((p) => p.id === a.petId)?.name}
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
      </AnimatedScrollView>
      <BottomTabBar active="overallAppointments" go={go} anim={tabBar.anim} />
    </SafeAreaView>
  );
}

export default OverallAppointmentsScreen;
